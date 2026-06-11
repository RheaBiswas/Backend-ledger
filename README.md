# Backend Ledger System

A secure ledger-based transaction management system built with Node.js, Express.js, MongoDB, and JWT Authentication.

This project follows a double-entry ledger architecture where account balances are derived from immutable ledger entries rather than being stored directly. It also implements idempotent transactions to prevent duplicate transfers and uses MongoDB transactions for consistency.

---

## Features

### Authentication & Authorization
- User Registration
- User Login
- User Logout
- JWT-based Authentication
- Protected Routes
- Token Blacklisting
- System User Authorization

### Account Management
- Create Account
- Retrieve User Accounts
- Get Real-Time Account Balance
- Account Status Management (ACTIVE, FROZEN, CLOSED)

### Transaction System
- Account-to-Account Transfers
- Double-Entry Ledger Architecture
- Idempotency Key Support
- MongoDB Transactions
- Balance Validation
- Account Ownership Verification
- Transaction Status Tracking

### Ledger Features
- Immutable Ledger Entries
- Credit/Debit Recording
- Balance Derived from Ledger History
- Audit-Friendly Design

### Email Notifications
- Registration Emails
- Successful Transaction Emails
- Failure Notification Support

---

## Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT (JSON Web Tokens)
- Cookie-Based Authentication

### Security
- bcryptjs
- Token Blacklisting

### Communication
- Nodemailer
- Gmail OAuth2

---

## Project Architecture

```text
Backend-ledger/
│
├── config/
│   └── db.js
│
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── account.controller.js
│   │   └── transaction.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── account.model.js
│   │   ├── transaction.model.js
│   │   ├── ledger.model.js
│   │   └── blackList.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── account.routes.js
│   │   └── transaction.routes.js
│   │
│   ├── services/
│   │   └── email.service.js
│   │
│   └── app.js
│
├── server.js
├── package.json
└── README.md
```

---

## Ledger Flow

Instead of storing balances directly:

1. Every transfer creates:
   - One DEBIT entry
   - One CREDIT entry

2. Account balance is calculated as:

```text
Balance = Total Credits - Total Debits
```

3. Ledger entries are immutable and cannot be modified or deleted.

---

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

#### Login User

```http
POST /api/auth/login
```

#### Logout User

```http
POST /api/auth/logout
```

---

### Accounts

#### Create Account

```http
POST /api/accounts
```

#### Get User Accounts

```http
GET /api/accounts
```

#### Get Account Balance

```http
GET /api/accounts/balance/:accountId
```

---

### Transactions

#### Transfer Funds

```http
POST /api/transactions
```

Request Body:

```json
{
  "fromAccount": "accountId",
  "toAccount": "accountId",
  "amount": 1000,
  "idempotencyKey": "unique-key"
}
```

#### Initial Funding (System User)

```http
POST /api/transactions/system/initial-funds
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email

CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Backend-ledger.git
```

### Install Dependencies

```bash
npm install
```

### Start Server

```bash
npm start
```

Development Mode:

```bash
npm run dev
```

---

## Security Measures Implemented

- Password Hashing using bcrypt
- JWT Authentication
- Token Blacklisting
- Account Ownership Validation
- Idempotent Transactions
- Immutable Ledger Records
- Protected Routes
- MongoDB Session Transactions

---

## Future Improvements

- Swagger API Documentation
- Rate Limiting
- Refresh Tokens
- Role-Based Access Control (RBAC)
- Transaction History Pagination
- Account Freeze/Unfreeze APIs
- Admin Dashboard
- Docker Deployment
- Unit & Integration Testing

---

## Author

**Rhea Biswas**

Backend Developer | Node.js | Express.js | MongoDB

GitHub: https://github.com/RheaBiswas

---

## License

This project is licensed under the MIT License.
