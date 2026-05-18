# 🏦 NexaBank — Bank Management System

A full-stack CRUD Bank Management System built with **React**, **Spring Boot**, and **MySQL**.

---

## 📁 Project Structure

```
bank-management/
├── backend/          ← Spring Boot (Java 17)
├── frontend/         ← React 18
└── database/         ← SQL schema
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## 🗄️ Database Setup

1. Start your MySQL server
2. Create the database:
   ```sql
   CREATE DATABASE bankdb;
   ```
3. (Optional) Run `database/schema.sql` for manual table creation + sample data.

**Spring Boot auto-creates tables** on first run using JPA (`ddl-auto=update`).

---

## 🔧 Backend Setup (Spring Boot)

1. Open `backend/src/main/resources/application.properties`
2. Update your MySQL credentials:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
3. Navigate to the backend directory and run:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. API runs at: `http://localhost:8080`

---

## 💻 Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. App opens at: `http://localhost:3000`

---

## 🌐 API Endpoints

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/{id}` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | Get all accounts |
| GET | `/api/accounts/{id}` | Get account by ID |
| GET | `/api/accounts/customer/{customerId}` | Get accounts by customer |
| POST | `/api/accounts/customer/{customerId}` | Create account |
| PUT | `/api/accounts/{id}` | Update account |
| DELETE | `/api/accounts/{id}` | Delete account |
| POST | `/api/accounts/{id}/deposit` | Deposit funds |
| POST | `/api/accounts/{id}/withdraw` | Withdraw funds |
| POST | `/api/accounts/{id}/transfer` | Transfer funds |
| GET | `/api/accounts/{id}/transactions` | Get transactions |

---

## ✨ Features

- **Customer Management**: Add, edit, delete, and view customers
- **Account Management**: Create savings/checking/fixed deposit accounts per customer
- **Transactions**: Deposit, withdrawal, and inter-account transfers
- **Transaction History**: Per-account transaction log with balances
- **Dashboard**: Overview with stats and recent activity
- **Validation**: Server-side validation with meaningful error messages

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Spring Boot 3.2, Spring Data JPA, Spring Validation |
| Database | MySQL 8.0 |
| Build | Maven (backend), npm (frontend) |

---

## 📝 Notes

- CORS is configured to allow `http://localhost:3000`
- Account numbers are auto-generated (10 digits)
- All monetary values use `BigDecimal` for precision
- Transactions are wrapped in `@Transactional` for consistency
