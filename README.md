# EventOps - Event Management, Ticketing & Escrow Marketplace

**EventOps** is a full-stack platform designed to combat ticket fraud, streamline vendor hiring, and secure financial transactions using a built-in M-Pesa escrow protection model. 

Built using a decoupled architecture powered by **Django REST Framework (DRF)** on the backend and **React (Vite)** on the frontend, hosted live on Render and Vercel.

---

## Key Features & Accomplishments

### 1. Robust Role-Based Access Control (RBAC) & Authentication
* **JWT Authentication:** Secure token-based session management.
* **Role Separation:** Distinct workflows and interfaces for **Attendees**, **Organizers**, and **Vendors**.
* **Route Safeguards:** Dynamic role checks ensuring attendees cannot access organizer portals or trigger unauthorized event management actions, preventing blank layout crashes.

### 2. Event Management & Ticketing Engine
* **Dynamic Publishing:** Organizers can create, edit, and publish events complete with automated banner image uploads via Cloudinary.
* **Tiered Ticketing:** Support for flexible ticket classes (Regular, VIP, VVIP) with real-time inventory tracking and custom pricing.

### 3. Vendor Marketplace
* **Service Directories:** Verified service providers (caterers, photographers, security, DJs) can showcase packages.
* **Event-Bound Booking:** Organizers can link service bookings directly to their scheduled events, establishing clear accountability.

### 4. Secure Escrow & M-Pesa Daraja Integration
* **Automated STK Push:** Instant C2B mobile checkout prompts sent directly to user phones.
* **Secure Webhook Callbacks:** Configured backend callback handlers decorated with CSRF exemptions to seamlessly ingest Safaricom confirmation webhooks in production.
* **Escrow Protection:** Funds are held securely in a `HELD` state until service delivery or event execution is verified, after which organizers can release payouts directly to registered vendor mobile numbers.

---

## Technology Stack

* **Backend:** Python, Django 6, Django REST Framework (DRF)
* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, React Router
* **Database:** PostgreSQL *(managed via Cloud/Render)*
* **Media Management:** Cloudinary API
* **Payment Gateway:** Safaricom Daraja API (STK Push & Webhook management)
* **Deployment:** Render (Backend/Gunicorn/Whitenoise) & Vercel (Frontend)

---

## Deployment Architecture

* **Backend (Render):** Runs a persistent Gunicorn production server utilizing Whitenoise for static file handling and environment-driven configurations (`DEBUG=False`).
* **Frontend (Vercel):** Serves the optimized React single-page application with automatic routing fallbacks.
* **Webhooks:** Secure server-to-server communication established between Safaricom's Daraja servers and the live Render backend callback endpoint.

---

## Getting Started Locally

### Prerequisites
* Python 3.10+
* Node.js & npm
* PostgreSQL

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Security & Best Practices
* **Production Environment Isolation:** Environment variables (`.env`) strictly segregate development credentials from production keys.
* **Webhook Security:** External payment callbacks bypass CSRF validation safely through targeted view decorators to prevent verification drops.
* **Defensive Frontend Routing:** Automatic redirects safeguard unprivileged users from hitting empty management views.