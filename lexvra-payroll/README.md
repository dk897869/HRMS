# LEXVRA INFINOLOGY Enterprise HRMS + Payroll + ERP System

A complete, production-ready, multi-tenant capable Enterprise HRMS + Payroll + ERP System built for **LEXVRA INFINOLOGY PRIVATE LIMITED** using the MERN Stack (MongoDB, Express.js, React 19, Node.js).

---

## 🌟 Tech Stack

### Frontend
- **Framework & Build Tool**: React 19, Vite, React Router DOM v7
- **UI Components & Styling**: Material UI (MUI v6), Vanilla CSS, Framer Motion, Glassmorphism design system
- **State Management & Query**: Redux Toolkit, Redux Persist
- **Data Tables & Charts**: Recharts, DataGrid
- **Utilities & Formatting**: Axios, React Hot Toast, Dayjs, Socket.io Client

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT Access & Refresh Tokens, Google OAuth 2.0 (Passport.js), Password Hashing (Bcrypt)
- **Payroll & Documents**: PDFKit (Payslip PDF generation), XLSX (Excel Export engine)
- **Security & Sockets**: Helmet, Rate Limiter, CORS, Compression, Socket.io Real-time alerts

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev # or node src/server.js
```
*The backend automatically seeds initial demo data and default Admin account on first launch.*

- **Admin Login Email**: `admin@lexvra.com`
- **Admin Password**: `Admin@123`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📑 Key Modules Included
1. **Authentication**: Glassmorphic login card, Email/Password login, Google OAuth, OTP verification.
2. **Dynamic RBAC**: Matrix permission editor for Super Admin, Admin, HR, Payroll, Finance, Manager, Employee.
3. **Admin Dashboard**: Live attendance punch curve, employee status breakdown, pending biometrics.
4. **Employee Directory**: Full CRUD, search, filter, export to Excel.
5. **Attendance System**: Geo-location check-in / check-out, status tracking (Present, Late, Absent).
6. **Payroll Engine**: Indian statutory calculations (PF, ESI, Professional Tax, TDS/Income Tax), automated bulk monthly payroll generation, downloadable branded PDF payslips.
7. **Leave Management**: Leave types, apply leave modal, multi-tier approve/reject workflow.
8. **Reimbursements & Claims**: Expense reimbursement requests and approval workflow.
9. **Recruitment & ATS**: Active job requisitions and candidate hiring pipeline.
10. **Reports & Analytics**: One-click Excel export for Employees, Attendance, and Payroll.
11. **System Settings**: Enterprise branding, currency, timezone, and security settings.

---

© 2026 Lexvra Infinology Pvt. Ltd. All rights reserved.
