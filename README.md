# WashFlow – CarWash Management System

WashFlow is a full-stack car wash management system designed to streamline car wash operations through web and mobile applications. It provides customer order management, staff operations, authentication, and payment integration.

## Features

### Customer Web Application
- Customer-facing web interface.
- Car wash order management.
- Payment integration with Midtrans Sandbox (QRIS).

### Staff Mobile Application
- Mobile application for staff operations.
- Secure authentication using JWT.
- Role-based access control (Admin and Staff).
- Order status management.

### Backend API
- RESTful API built with Node.js, Express.js, and TypeScript.
- JWT-based authentication and authorization.
- User and order management.
- PostgreSQL database integration using Prisma ORM.
- Support for multiple payment methods.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend Web | React.js, Vite, Tailwind CSS, shadcn/ui |
| Mobile | React Native, Expo, NativeWind |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcrypt |
| Payment Gateway | Midtrans Sandbox |

## Application Workflow

### Order Status

`WAITING` → `IN_PROGRESS` → `COMPLETED`

Orders can only be edited or deleted while they are in the `WAITING` status.

### Payment Methods

- CASH
- TRANSFER
- QRIS

QRIS payments are integrated with Midtrans Sandbox for testing purposes.

## Project Structure

```text
carwash-management/
├── client/
├── customer-web/
├── native/
├── server/
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Expo Go (for mobile application testing)

### Backend Setup

```bash
cd server
npm install
```

Configure the required environment variables, including the database connection and authentication credentials.

Generate the Prisma Client and run database migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

### Customer Web Setup

```bash
cd customer-web
npm install
npm run dev
```

### Mobile Application Setup

```bash
cd native
npm install
npx expo start
```

Make sure the mobile application is configured to connect to the backend API using the appropriate local network address.

## Project Purpose

WashFlow was developed as a full-stack development project to apply practical skills in web and mobile development, RESTful API development, database management, authentication, and third-party payment integration.

## Author

**Muhamad Fachri Maulana**
