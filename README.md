# AutoVerse — The Automotive Encyclopedia

A modern web app for car enthusiasts. Browse thousands of vehicles, explore full technical specs, and view interactive 3D models.

---

## Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Backend   | Python · FastAPI · uvicorn                  |
| Car Data  | [CarQuery API](https://www.carqueryapi.com) — free, no key needed |
| 3D Models | [Sketchfab](https://sketchfab.com) embed — free account needed |
| Frontend  | React 18 · Vite · Tailwind CSS · Framer Motion |

---

## Quick Start

### 1. Backend

```bash
cd autoverse/backend

# Copy the env template
cp .env.example .env

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
python main.py
```

The API will start at **http://localhost:8000**
API docs (Swagger): http://localhost:8000/docs

---

### 2. Frontend

```bash
cd autoverse/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173**

---

## Optional: Enable 3D Models (Sketchfab)

1. Create a **free** account at [sketchfab.com](https://sketchfab.com)
2. Go to **Account Settings → Password & API**
3. Copy your **API Token**
4. Open `backend/.env` and paste it:
   ```
   SKETCHFAB_API_KEY=your_token_here
   ```
5. Restart the backend

When configured, AutoVerse searches Sketchfab's huge library of 3D car models and embeds the best match automatically.

---

## Features

- **400+ car makes**, thousands of models from CarQuery's database
- **Full spec sheets**: horsepower, torque, 0–100 km/h, top speed, displacement, engine type, drivetrain, dimensions, weight, fuel economy, and more
- **Trim selector**: switch between variants of the same car (e.g., BMW 3 Series M340i vs 330i)
- **Dual units**: specs shown in both imperial and metric
- **3D viewer**: embedded Sketchfab model with orbit controls (requires free API key)
- **Dark UI** optimised for desktop, responsive layout

---

## Converting to Mobile (Future)

**Easiest path — Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm run build
npx cap add ios   # or android
npx cap open ios
```
Capacitor wraps the existing React web app in a native iOS/Android shell — no code rewrite needed.

**Alternatively — React Native:**
The Python FastAPI backend stays identical. Rebuild the UI in React Native, sharing your API hooks and formatter utilities.

---

## Project Structure

```
autoverse/
├── backend/
│   ├── main.py            # FastAPI app — proxies CarQuery & Sketchfab APIs
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx                        # Root layout and state
    │   ├── components/
    │   │   ├── Header.jsx                 # Top navigation bar
    │   │   ├── SearchPanel.jsx            # Make → Model → Year → Trim dropdowns
    │   │   ├── ModelViewer.jsx            # Sketchfab 3D embed or styled placeholder
    │   │   ├── StatsPanel.jsx             # Organised stat sections
    │   │   └── StatCard.jsx               # Individual animated stat card
    │   └── utils/
    │       └── formatters.js              # Unit conversions (PS→HP, Nm→lb-ft, etc.)
    ├── vite.config.js                     # Proxies /api/* to FastAPI
    └── tailwind.config.js
```
