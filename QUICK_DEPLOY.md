# Quick Deploy Guide - ONGC RAG Chatbot

## 🚀 Fastest Way to Deploy

### Step 1: Deploy Backend to Railway (5 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Deploy
railway init
railway up

# Add environment variable
railway variables set GOOGLE_API_KEY=your_api_key_here

# Get your backend URL
railway domain
# Copy the URL (e.g., https://ongc-backend.up.railway.app)
```

### Step 2: Deploy Frontend to Vercel (3 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Create production environment file
echo "REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api" > .env.production

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Update CORS (2 minutes)

1. Edit `backend/server.js`
2. Update CORS origin:
   ```javascript
   app.use(cors({
     origin: ['https://your-vercel-app.vercel.app'],
     credentials: true
   }));
   ```
3. Redeploy backend:
   ```bash
   cd backend
   railway up
   ```

### Done! ✅

Your app is now live at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.up.railway.app`

---

## Alternative: All-in-One Vercel Deploy

⚠️ **Note**: Vercel has limitations for backends with file uploads. Use Railway for backend instead.

If you still want to try Vercel for both:

```bash
# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd frontend
vercel --prod
```

---

## Environment Variables Needed

### Backend (Railway)
- `GOOGLE_API_KEY` - Your Google Gemini API key

### Frontend (Vercel)
- `REACT_APP_API_URL` - Your backend URL + /api

---

## Troubleshooting

**Problem**: CORS errors
- **Fix**: Add your frontend URL to CORS in backend/server.js

**Problem**: API not responding
- **Fix**: Check Railway logs: `railway logs`

**Problem**: Build fails
- **Fix**: Run `npm install` locally first to check for errors

---

## Get API Keys

1. **Google Gemini API**: https://makersuite.google.com/app/apikey
2. **Railway Account**: https://railway.app
3. **Vercel Account**: https://vercel.com

---

**Total Time**: ~10 minutes
**Cost**: $0 (Free tiers)
