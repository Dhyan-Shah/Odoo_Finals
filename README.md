# ☕ Odoo POS Cafe

A full-stack Restaurant Point-of-Sale application with real-time order management, role-based access, and customer-facing QR menu.

---

## 🏗️ Project Structure

```
odoo-pos-cafe/
├── backend/          # Node.js + Express + Socket.io + MongoDB
└── frontend/         # React + Vite + Tailwind CSS + Zustand
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/odoo-pos-cafe
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

On first run, a default admin account is auto-created:
- **Email:** admin@cafe.com
- **Password:** admin123

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔐 Staff Login

All staff log in at: `/staff/login`

After login, they are automatically redirected based on their role:
- **Admin** → `/admin/dashboard`
- **Waiter** → `/waiter/floor`
- **Kitchen** → `/kitchen/display`

---

## 👤 Roles

| Role    | Access                                                     |
|---------|------------------------------------------------------------|
| Admin   | Full dashboard, products, categories, floors, staff, analytics, reports, settings |
| Waiter  | Floor view, session management, order tracking, payment confirmation |
| Kitchen | Full-screen ticket display, order status updates, item availability control |

---

## 📱 Customer Flow

1. Customer scans QR code on table → opens `/table?token=TABLE_TOKEN`
2. If waiter hasn't started session → shows waiting screen
3. If session active → shows menu grouped by category
4. Customer adds items to cart and places orders
5. Orders appear instantly on Kitchen Display
6. Kitchen marks orders In Progress → Ready
7. Waiter gets notified, delivers food, marks as Served
8. Customer taps Pay Now → selects UPI / Cash / Card
9. Payment confirmed → Session ends → Table freed

---

## 🔌 Real-Time Events (Socket.io)

| Event | From | To |
|-------|------|----|
| `customer:order_placed` | Customer | Kitchen |
| `kitchen:order_in_progress` | Kitchen | Customer |
| `kitchen:order_ready` | Kitchen | Customer + Waiter |
| `waiter:order_served` | Waiter | Customer |
| `customer:pay_now` | Customer | Waiter |
| `waiter:cash_confirmed` | Waiter | Customer |
| `customer:upi_paid` | Customer | Waiter |
| `product:availability_changed` | Kitchen/Admin | All customers |
| `table:status_changed` | Waiter | All waiters |

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, Socket.io, MongoDB (Mongoose), JWT, bcryptjs

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Zustand, Axios, Socket.io-client, qrcode.react, Lucide React

---

## 📦 Production Build

```bash
# Frontend
cd frontend && npm run build

# Serve backend + static frontend
# Copy frontend/dist to backend/public and serve it from Express
```
