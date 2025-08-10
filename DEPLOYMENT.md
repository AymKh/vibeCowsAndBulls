# Deployment Guide

This guide will help you deploy the Cows & Bulls multiplayer game with the backend on Render and frontend on Netlify.

## Backend Deployment (Render)

### Step 1: Prepare Your Repository
1. Push all your code to GitHub
2. Make sure your `package.json` has the correct start script: `"start": "node server.js"`

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `cows-bulls-server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add environment variables:
   - `NODE_ENV` = `production`
6. Deploy the service
7. Note down your Render URL (e.g., `https://your-app-name.onrender.com`)

### Step 3: Update Environment Configuration
Update `vibe-cows-bulls/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  socketUrl: 'https://your-render-backend-url.onrender.com'
};
```

## Frontend Deployment (Netlify)

### Step 1: Prepare the Frontend
1. Update the environment file with your Render backend URL
2. Make sure `netlify.toml` is in the `vibe-cows-bulls` directory

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `vibe-cows-bulls`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist/vibe-cows-bulls`
5. Deploy the site

### Step 3: Update CORS Configuration
After getting your Netlify URL, update the CORS configuration in `server.js`:
```javascript
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:4200",
      "https://your-netlify-site.netlify.app",  // Replace with your actual URL
      /\.netlify\.app$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## Important Notes

1. **Free Tier Limitations**:
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down may take 30+ seconds
   - Consider upgrading to paid tier for production use

2. **Environment URLs**:
   - Development: `http://localhost:3000`
   - Production: Your Render service URL

3. **HTTPS Required**:
   - Both Render and Netlify use HTTPS by default
   - Socket.IO connections will be secure (WSS)

## Troubleshooting

- **CORS Errors**: Make sure your Netlify URL is added to the CORS configuration
- **Connection Issues**: Verify the socket URL in environment.prod.ts matches your Render service
- **Build Errors**: Check the build logs in both services for specific error messages

## Testing

1. Open your Netlify site
2. Try creating a room in both competitive and host modes
3. Test with multiple browser tabs/devices
4. Verify real-time updates work correctly