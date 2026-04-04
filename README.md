# Velvet Brew — Odoo POS Cafe (Redesigned)

A completely redesigned cafe Point-of-Sale system with a **Red Velvet & Beige** luxury theme.

## 🎨 Design Changes

### Theme
- **Primary**: Red Velvet gradient (`#8B1A1A → #c0392b`)
- **Background**: Warm beige/cream (`#fdf8f4`)
- **Typography**: Cormorant Garamond (display) + Nunito (body)
- **Cards**: Soft white with warm shadows

### New Pages
- **Landing Page** (`/landing`) — Animated 3D landing page with:
  - Floating 3D coffee cup SVG with steam
  - Animated gradient orbs
  - Mouse-tilt 3D feature cards
  - Floating live-data widgets
  - Stats, features, roles sections

### Updated Pages
- **Staff Login** — Split-panel with velvet left side and beige form
- **Admin Layout** — Velvet red sidebar with glass-effect navigation
- **Admin Dashboard** — Gradient stat cards with shine animations
- **Admin Analytics** — **4 new charts**:
  - Revenue Bar Chart (by waiter)
  - Revenue Pie/Donut Chart (share breakdown)
  - Sessions Comparison Bar Chart
  - Performance Radar Chart
  - Session Revenue Timeline Line Chart (when waiter selected)
- **Admin Products** — Full table with toggle availability
- **Admin Staff** — Refreshed with avatar initials
- **Admin Categories** — Card grid with gradient icons
- **Waiter Layout** — Velvet top bar
- **Waiter Floor** — Improved table cards with status dots
- **Modal & Confirm** — Warmer, rounded design
- **Toast** — Refined notification style

## 🚀 Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
node server.js
```

### Default Credentials
| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@cafe.com     | admin123  |
| Waiter  | waiter@cafe.com    | waiter123 |
| Kitchen | kitchen@cafe.com   | kitchen123|

## 📦 Tech Stack
- React 18 + Vite
- TailwindCSS 3
- Recharts (analytics graphs)
- Socket.IO (real-time)
- Zustand (state)
- Express.js + MongoDB (backend)
