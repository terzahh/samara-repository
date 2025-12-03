# Render Deployment

This project is configured for deployment on Render.com.

## Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Manual Deployment

See [Render Deployment Guide](file:///.gemini/antigravity/brain/7de14079-41b5-41d3-a7b0-729bf01a2cb7/render_deployment_guide.md) for detailed instructions.

## Environment Variables Required

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `CLIENT_URL` - Your frontend URL (for CORS)
- `NODE_ENV` - Set to `production`
- `PORT` - Set to `10000` (Render default)

## Build & Start Commands

- **Build Command**: `npm install`
- **Start Command**: `npm run server`

## Health Check

After deployment, test: `https://your-app.onrender.com/api/health`
