# ☕ Odoo POS Cafe

A real-time Restaurant Point-of-Sale system built for the **Odoo Hackathon**. It covers the complete lifecycle of a restaurant visit — from a customer scanning a table QR code and placing an order, to kitchen staff preparing it, a waiter serving it, and the customer paying via UPI, Card, or Cash.

---

## 👥 Team

| Name | Role |
|---|---|
| Vraj Soni | Full Stack Developer |
| Darsh Patel | Full Stack Developer |
| Dhyan Shah | Full Stack Developer+Hardware |

---

## 👤 Users

| Role | Access |
|---|---|
| **Customer** | Scans table QR, browses menu, places order, tracks food status, pays |
| **Waiter** | Manages tables and sessions, gets notified when food is ready, collects cash |
| **Kitchen Staff** | Sees incoming orders, updates cooking stages, toggles item availability |
| **Admin** | Manages products, tables, floors, staff accounts, views analytics and reports |

---

## ✨ Features

**Customer**
- Scan table QR to open menu — no login needed
- Place orders and track real-time status: Placed → In Progress → Ready → Served → Paid
- Pay via UPI QR (auto-generated with exact amount), Card, or Cash

**Waiter**
- Floor view with live table status (Free, Occupied, Payment mode)
- Lock into a table session — table is isolated to that waiter only
- Get notified when kitchen marks an order Ready
- Confirm cash collection — recorded against the waiter's name

**Kitchen Staff**
- Live ticket display for all incoming orders
- Two-stage flow — In Progress → Ready (notifies waiter on Ready)
- Toggle any item as unavailable — instantly hides it from customer menu

**Admin**
- Full product, category, floor, and table management
- Generate table QR codes for physical placement
- Waiter performance analytics — tables managed, sessions, revenue collected
- Reports filtered by date, waiter, payment method, and table

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| State | Zustand |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| QR Code | qrcode.react |
| Icons | Lucide React |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 🔔 Hardware — Raspberry Pi + Buzzer

A Raspberry Pi is connected to a buzzer and runs a small Flask server alongside the main application. The POS backend sends HTTP requests to this server to trigger buzzer events at key moments:

- **Single beep** — when a customer places a new order, alerting kitchen staff
- **Double beep** — when kitchen marks an order as Ready, alerting the waiter to pick it up

The Pi GPIO controls the buzzer directly. The backend posts to `/hardware/buzzer` with the number of beeps, and the Pi handles the rest independently — keeping hardware completely decoupled from the software stack.

```
POS Backend → POST /hardware/buzzer { times: 1 } → Raspberry Pi → GPIO → Buzzer
```

---

## 🏆 Built For

**Odoo Hackathon** — 24-hour build challenge.