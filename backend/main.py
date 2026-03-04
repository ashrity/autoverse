from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json
import asyncio
from typing import Optional

app = FastAPI(title="AutoVerse API", description="Car data and image search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CARQUERY_BASE  = "https://www.carqueryapi.com/api/0.3/"
COMMONS_API    = "https://commons.wikimedia.org/w/api.php"
WIKI_API       = "https://en.wikipedia.org/w/api.php"
WIKI_REST      = "https://en.wikipedia.org/api/rest_v1"

CARQUERY_HEADERS = {
    "User-Agent": "AutoVerse/1.0 (car enthusiast application)",
    "Accept": "text/javascript,application/json,*/*",
    "Referer": "https://www.carqueryapi.com/",
}

VALID_MIMES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

# ── CarQuery helper ────────────────────────────────────────────────────────────

async def carquery_get(params: dict) -> dict:
    """Proxy a request to CarQuery API, handling its JSONP response format."""
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.get(
                CARQUERY_BASE,
                params={**params, "callback": "cb"},
                headers=CARQUERY_HEADERS,
            )
            response.raise_for_status()
            text = response.text.strip()

            if text.startswith("cb("):
                inner = text[3:].rstrip(");").rstrip(")")
                return json.loads(inner)

            return response.json()

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"CarQuery API returned {e.response.status_code}")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"CarQuery error: {str(e)}")


# ── CarQuery endpoints ─────────────────────────────────────────────────────────

@app.get("/api/makes")
async def get_makes():
    data = await carquery_get({"cmd": "getMakes"})
    return [
        {
            "make_id": m["make_id"],
            "make_display": m["make_display"],
            "make_country": m.get("make_country", ""),
            "make_is_common": m.get("make_is_common", "0") == "1",
        }
        for m in data.get("Makes", [])
    ]


@app.get("/api/models/{make}")
async def get_models(make: str):
    data = await carquery_get({"cmd": "getModels", "make": make})
    return [
        {"model_name": m["model_name"], "model_make_id": m["model_make_id"]}
        for m in data.get("Models", [])
    ]


@app.get("/api/years/{make}/{model}")
async def get_years(make: str, model: str):
    data = await carquery_get({"cmd": "getTrims", "make": make, "model": model})
    years = sorted(
        set(t["model_year"] for t in data.get("Trims", []) if t.get("model_year")),
        reverse=True,
    )
    return years


@app.get("/api/trims/{make}/{model}/{year}")
async def get_trims(make: str, model: str, year: str):
    data = await carquery_get({"cmd": "getTrims", "make": make, "model": model, "year": year})
    trims = data.get("Trims", [])
    if not trims:
        raise HTTPException(status_code=404, detail=f"No trims found for {year} {make} {model}")
    return trims


# ── Wikimedia Commons image helpers ───────────────────────────────────────────

async def _commons_search(client: httpx.AsyncClient, query: str, limit: int = 25) -> list[str]:
    """Search Wikimedia Commons File namespace, return list of File: titles."""
    try:
        resp = await client.get(
            COMMONS_API,
            params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "srnamespace": "6",       # File namespace only
                "srlimit": str(limit),
                "format": "json",
                "origin": "*",
            },
            timeout=10.0,
        )
        hits = resp.json().get("query", {}).get("search", [])
        return [h["title"] for h in hits]
    except Exception:
        return []


async def _fetch_image_infos(client: httpx.AsyncClient, titles: list[str]) -> list[dict]:
    """Batch-fetch imageinfo for a list of File titles; returns filtered image dicts."""
    if not titles:
        return []
    try:
        resp = await client.get(
            COMMONS_API,
            params={
                "action": "query",
                "titles": "|".join(titles[:20]),   # API max
                "prop": "imageinfo",
                "iiprop": "url|mime|size",
                "iiurlwidth": "1200",               # generate a 1200-wide thumbnail URL
                "format": "json",
                "origin": "*",
            },
            timeout=10.0,
        )
        pages = resp.json().get("query", {}).get("pages", {})
        results = []
        for page_id, page in pages.items():
            if int(page_id) < 0:        # -1 = not found
                continue
            ii_list = page.get("imageinfo", [])
            if not ii_list:
                continue
            ii = ii_list[0]

            mime = ii.get("mime", "")
            if mime not in VALID_MIMES:
                continue

            # Use thumburl (1200px) when available, else full url
            display_url = ii.get("thumburl") or ii.get("url", "")
            full_url    = ii.get("url", "")

            if not display_url:
                continue

            width  = ii.get("thumbwidth")  or ii.get("width",  0)
            height = ii.get("thumbheight") or ii.get("height", 0)

            # Reject very small images
            if width < 350 or height < 200:
                continue

            # Reject very portrait images (logos, interior detail shots)
            if height > 0 and width / height < 0.8:
                continue

            results.append({
                "url":     display_url,
                "fullUrl": full_url,
                "mime":    mime,
                "width":   width,
                "height":  height,
                "title":   page.get("title", "").replace("File:", "").rsplit(".", 1)[0],
                "source":  "Wikimedia Commons",
                "sourceUrl": f"https://commons.wikimedia.org/wiki/{page.get('title','').replace(' ', '_')}",
            })
        return results
    except Exception:
        return []


def _relevance_score(img: dict, make: str, model: str, year: str) -> float:
    """Higher score = more relevant. PNG gets bonus; year match gets bonus."""
    title = img["title"].lower()
    make_words  = [w for w in make.lower().split()  if len(w) > 2]
    model_words = [w for w in model.lower().split() if len(w) > 2]

    score = 0.0
    if any(w in title for w in make_words):  score += 2.0
    if any(w in title for w in model_words): score += 2.0
    if year and year in title:               score += 3.0   # year in filename is very specific
    if img["mime"] == "image/png":           score += 1.0   # PNG may be transparent
    score += min(img["width"], 2400) / 2400                 # prefer larger images
    return score


async def _wikipedia_article_image(client: httpx.AsyncClient, make: str, model: str, year: str) -> Optional[dict]:
    """
    Last-resort fallback: grab the lead image from the Wikipedia article about the car.
    Returns a single image dict or None.
    """
    queries = [f"{year} {make} {model}", f"{make} {model}"]
    for q in queries:
        try:
            search = await client.get(
                WIKI_API,
                params={"action": "query", "list": "search", "srsearch": q,
                        "format": "json", "srlimit": 5, "origin": "*"},
                timeout=8.0,
            )
            hits = search.json().get("query", {}).get("search", [])
            for hit in hits:
                title = hit["title"].replace(" ", "_")
                summary = await client.get(
                    f"{WIKI_REST}/page/summary/{title}",
                    headers={"Accept": "application/json"},
                    timeout=8.0,
                )
                if summary.status_code != 200:
                    continue
                data = summary.json()
                desc = (data.get("description", "") + " " + data.get("extract", "")).lower()
                if not any(kw in desc for kw in ("automobile", "car", "vehicle", "motor", "sedan", "coupe", "suv", "truck")):
                    continue
                original  = data.get("originalimage", {}).get("source", "")
                thumbnail = data.get("thumbnail", {}).get("source", "")
                img_url   = original or thumbnail
                if img_url:
                    return {
                        "url":       img_url,
                        "fullUrl":   img_url,
                        "mime":      "image/jpeg",
                        "width":     data.get("originalimage", {}).get("width", 800),
                        "height":    data.get("originalimage", {}).get("height", 500),
                        "title":     data.get("title", f"{make} {model}"),
                        "source":    "Wikipedia",
                        "sourceUrl": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                    }
        except Exception:
            continue
    return None


# ── Car images endpoint ────────────────────────────────────────────────────────

@app.get("/api/car-images")
async def get_car_images(
    make:  str = Query(...),
    model: str = Query(...),
    year:  str = Query(""),
):
    """
    Return up to 5 free images of the requested car from Wikimedia Commons.
    Images are sorted by relevance (year match, name match, PNG bonus).
    Falls back to the Wikipedia article lead image if Commons finds nothing.
    No API key required.
    """
    year_prefix = f"{year} " if year else ""

    # Multiple search queries — specific first, broader last
    queries = [
        f"{year_prefix}{make} {model}",
        f"{make} {model}",
        f"{make} {model} automobile",
    ]

    collected_titles: list[str] = []
    seen_titles: set[str] = set()

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # Gather file titles from all queries (deduplicated)
        search_tasks = [_commons_search(client, q) for q in queries]
        all_results  = await asyncio.gather(*search_tasks)

        for title_list in all_results:
            for t in title_list:
                if t not in seen_titles:
                    seen_titles.add(t)
                    collected_titles.append(t)

        # Batch-fetch imageinfo in chunks of 20 (API limit)
        all_infos: list[dict] = []
        chunk_tasks = [
            _fetch_image_infos(client, collected_titles[i : i + 20])
            for i in range(0, min(len(collected_titles), 60), 20)
        ]
        chunks = await asyncio.gather(*chunk_tasks)
        for chunk in chunks:
            all_infos.extend(chunk)

        # Remove duplicates by URL
        seen_urls: set[str] = set()
        unique_infos: list[dict] = []
        for img in all_infos:
            if img["url"] not in seen_urls:
                seen_urls.add(img["url"])
                unique_infos.append(img)

        # Score and sort
        unique_infos.sort(
            key=lambda img: _relevance_score(img, make, model, year),
            reverse=True,
        )
        top = unique_infos[:5]

        # If we found fewer than 1 image, try Wikipedia article as last resort
        if not top:
            wiki_img = await _wikipedia_article_image(client, make, model, year)
            if wiki_img:
                top = [wiki_img]

    return top


# ── Health check ───────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
