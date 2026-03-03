# TreeHub Backend

>This is the Node.js/Express backend for TreeHub, a private marketplace and lending platform for Trees Residences.

## Features
- RESTful API (Express)
- MySQL database
- Authentication, rate limiting
- Email and image upload support

## Local Development

**Prerequisites:** Node.js, MySQL

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up `.env` with your database and secret keys.
3. Start the server:
   ```bash
   npm run dev
   ```

## Deployment
- Deploy on Railway, Render, or similar Node hosting.
- Set environment variables for DB and secrets in your host dashboard.
- The server listens on `process.env.PORT` for compatibility.

## Project Structure
- `controllers/` — Route logic
- `models/` — Database models
- `routes/` — API endpoints
- `services/` — Email, image, etc.
- `middleware/` — Auth, security

---