# Backend README

## Samara Repository - Backend

This is the Express.js backend server for the Samara Repository application.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   - `PORT`: Server port (default: 5000)
   - `NODE_ENV`: Environment (development/production)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `COOKIE_SECRET`: Random 64-character hex string
   - `CSRF_SECRET`: Random 64-character hex string
   - `CLIENT_URL`: Frontend URL (default: http://localhost:3000)

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on [http://localhost:5000](http://localhost:5000)

### Available Scripts

- `npm start` - Runs the server in production mode
- `npm run dev` - Runs the server with nodemon for development

### Project Structure

```
backend/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── scripts/         # Database scripts
├── index.js         # Entry point
└── package.json
```

### API Documentation

See `API_REFERENCE.md` for detailed API documentation.

### Security

- Never commit `.env` files
- Use service role key only on backend
- Configure CORS properly for production
- Keep dependencies updated
