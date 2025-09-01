# GargoyleOffGrid / Offline
> The **offline-first survival toolkit** — inventory, checklists, maps, and guides that still work when the grid doesn’t.

## What is this?
This is the **offline portion** of the GargoyleOffGrid ecosystem.  
It’s a lightweight Progressive Web App (PWA) that runs entirely on your device — no internet required after first load.  

Think of it as your **digital offline toolkit**:
- Track your inventory (food, meds, gear)  
- Auto-generate shopping lists from PAR levels  
- Use barcode/QR scanning to add or label items  
- Access checklists (blackout, bug-out, first 72h, etc.)  
- Store offline PDFs (first aid, canning, plant ID)  
- Save maps + mark caches, water sources, routes  
- Run basic power + water calculators  
- Export everything to print or share  

---

## Features
- **Inventory Manager** — offline database with expiry and PAR alerts.  
- **Checklists** — YAML-driven, printable, editable.  
- **Offline Library** — stash PDFs for reference.  
- **Maps (stub)** — add markers for caches, hazards, rendezvous.  
- **Power Planner** — quick solar/battery sizing.  
- **Export/Import** — JSON backups you can print or move to other devices.  

---

## Getting Started
```bash
git clone https://github.com/GargoyleOffGrid/offline.git
cd offline
npm install
npm run dev

open http://localhost:5173 in your browser
npm run build
```

---

## Tech Stack
- React + Vite — modern, fast, minimal boilerplate.
- Dexie.js — offline IndexedDB storage.
- Workbox Service Worker — caching for offline PWA use.
- ZXing — barcode + QR scanning.
- js-yaml — simple checklists from YAML files.
- Leaflet — map/marker support (offline tiles optional).

---

## Roadmap
- Inventory with PAR shopping list
- YAML checklists (printable)
- Library for PDFs
- Offline map tiles + GPX import/export
- Barter ledger
- Med log & substitution chart
- Scenario drill generator

---

### License

MIT — free to use, adapt, and extend.
