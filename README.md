# EventOps — Event Management, Ticketing & Escrow Marketplace

**EventOps** is a comprehensive event management, ticketing, and vendor marketplace platform designed to eliminate ticket fraud, streamline vendor hiring, and secure financial transactions using built-in M-Pesa escrow protection.

Built on a decoupled architecture using **Django REST Framework (DRF)** for the backend and **React** for the frontend UI.

---

##  Key Features

### 1. User Onboarding & Role-Based Access Control
* **JWT Authentication:** Secure token-based session management using JSON Web Tokens.
* **Role Management:**
  * **Attendees:** Discover events, purchase tickets, view purchase history.
  * **Organizers:** Publish events, manage ticket tiers, hire marketplace vendors, and release escrow funds.
  * **Vendors:** List service packages, accept booking requests, and receive payouts directly to their M-Pesa accounts.

### 2. Event Management & Ticketing Engine
* **Dynamic Event Creation:** Organizers can create, update, and publish detailed event listings.
* **Ticket Tiering & Inventory:** Support for multiple ticket types (e.g., VIP, General Admission, Early Bird) with automated inventory tracking to prevent overbooking.

### 3. Vendor Marketplace
* **Service Directory:** Service providers (photographers, caterers, DJs, security teams) can list portfolios and service packages.
* **Direct Booking System:** Organizers can request vendor bookings tied directly to their scheduled events.

### 4. Escrow Financial Engine (M-Pesa / Daraja Integration)
* **STK Push (C2B):** Organizers pay for vendor bookings via automated M-Pesa STK Push prompts.
* **Escrow Holding State:** Funds are securely locked in a `HELD` escrow status upon successful payment.
* **Automated Vendor Payout Lookup:** Releasing escrow automatically identifies the vendor linked to the booking and retrieves their registered M-Pesa phone number for disbursement.

---

##  Technology Stack

* **Backend Framework:** Django 5 & Django REST Framework (DRF)
* **Frontend Framework:** React (Vite)
* **Database:** PostgreSQL *(or SQLite for local development)*
* **Authentication:** `rest_framework_simplejwt` / `dj-rest-auth`
* **Payment Integration:** Safaricom Daraja M-Pesa API (STK Push & Escrow logic)
* **Media Storage:** Cloudinary Field Integration
* **Environment Management:** `python-decouple`

---

##  Getting Started

### Prerequisites
* Python 3.10+
* Node.js & npm (for React frontend)
* PostgreSQL (optional for local testing)

---

### Backend Setup (Django)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/eventops.git
   cd eventops
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables (`.env`):**
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   ALLOWED_HOSTS=127.0.0.1,localhost

   # Database Settings
   DATABASE_URL=postgres://user:password@localhost:5432/eventops_db

   # Safaricom Daraja M-Pesa Settings
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/finance/callback/
   ```

5. **Apply Database Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create a Superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the Development Server:**
   ```bash
   python manage.py runserver
   ```
   The backend API will be running at `http://127.0.0.1:8000/`.

---

##  Key API Endpoints Summary

### Authentication (`/api/users/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users/register/` | Register a new user (Attendee, Organizer, Vendor) |
| `POST` | `/api/users/login/` | Obtain JWT access and refresh tokens |
| `GET` | `/api/users/profile/` | Fetch current authenticated user's profile details |

### Finance & Escrow (`/api/finance/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/finance/stk-push/` | Initiate M-Pesa STK Push payment for booking |
| `POST` | `/api/finance/callback/` | Webhook URL triggered automatically by Safaricom |
| `POST` | `/api/finance/release-escrow/<id>/` | Release held escrow funds to vendor account |
| `GET` | `/api/finance/transactions/` | View transaction history based on user role |

---

##  Security & Best Practices

* **Role-Based Permissions:** Restricts vendor booking releases to authenticated event organizers.
* **Relational Phone Lookup:** Vendors do not re-enter payment numbers per listing; payouts map directly to verified account credentials.