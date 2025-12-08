# Frontend README

## Samara Repository - Frontend

This is the React frontend for the Samara Repository application.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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
   - `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Running the Application

**Development mode:**
```bash
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000)

**Production build:**
```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App (one-way operation)

### Project Structure

```
frontend/
├── public/          # Static files
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── services/    # API services
│   ├── config/      # Configuration files
│   └── ...
└── package.json
```

### Connecting to Backend

The frontend communicates with the backend API using the URL specified in `REACT_APP_API_URL`. Ensure the backend server is running before starting the frontend.
