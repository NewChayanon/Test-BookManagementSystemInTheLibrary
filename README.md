# Book Management System in the Library

This project is a backend API system for managing books in a library. It provides features such as book borrowing, returning, searching, and more, with role-based access control.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Running Tests](#running-tests)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/NewChayanon/Test-BookManagementSystemInTheLibrary.git
   cd Test-BookManagementSystemInTheLibrary
   ```

2. **Install the dependencies:**

   ```bash
   pnpm install
   ```

3. **Create a .env file in the root directory of the project and configure the environment variables as described in the [Environment Variables](#environment-variables) section.**

   ```bash
   touch .env
   ```

4. **Run the database migration:**

   ```bash
   pnpm exec prisma migrate dev --name init
   ```

5. **Start the development server:**

   ```bash
   pnpm dev
   ```

## Environment Variables

The application requires a few environment variables to be set. You can configure these in a .env file in the root directory of the project. An example .env file is provided below:

```bash
DATABASE_URL="mysql://root:password@localhost:3306/bookManagementSystemInTheLibrary"
DATABASE_NAME=bookManagementSystemInTheLibrary
PORT_BACK_END=8888
JWT_SECRET=TheSeCRET
```

- DATABASE_URL: The connection string for your MySQL database.
- DATABASE_NAME: The name of the MySQL database.
- PORT_BACK_END: The port number the backend server will run on.
- JWT_SECRET: The secret key used for signing JSON Web Tokens (JWT).

## Running the Application

1. **Start the development server:**

   ```bash
   pnpm dev
   ```

   The backend API will be accessible at http://localhost:8888.

## API Overview

The API is organized into three main sections: authentication, user operations, and admin operations. Below is a summary of the routes available:

**Authentication Routes**

- POST /auth/register: Register a new user.
- POST /auth/login: Login and obtain an access token.
- GET /auth/books: Search for books with various filters.
- GET /auth/books/most-borrowed: Get the most borrowed books.
- GET /auth/books/:bookId: Get details of a specific book.

**User Routes**

- GET /users/refresh-token: Refresh the JWT token.
- POST /users/borrowings: Borrow a book.
- POST /users/borrowings/:bookId/return: Return a borrowed book.

**Admin Routes**

- POST /admin/books: Create a new book (requires admin privileges).
- PUT /admin/books/:bookId: Edit an existing book (requires admin privileges).
- DELETE /admin/books/:bookId: Delete a book (requires admin privileges).

**Middleware**

- authenticate: Protect routes by ensuring that only authenticated users can access them.
- isAdmin: Restrict access to admin-only routes.
- rate-limit: Apply rate limiting to the API to prevent abuse

## Running Tests

To run the tests, use the following command:

```bash
pnpm jest
```
