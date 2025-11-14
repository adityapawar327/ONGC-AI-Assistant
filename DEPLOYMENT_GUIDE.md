# ONGC RAG Chatbot - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket

---

## Part 1: Deploy Backend (API)

### Method A: Using Vercel Dashboard (Easiest)

1. **Login to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"

2. **Import Backend Repository**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Choose the `backend` folder as the root directory

3. **Configure Backend Project**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty or `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   GOOGLE_API_KEY=your_actual_google_api_key
   PORT=5000
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://ongc-backend.vercel.app`)

### Method B: Using Vercel CLI

```bash
# Navigate to backend folder
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? ongc-rag-backend
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add GOOGLE_API_KEY
# Paste your API key when prompted

# Deploy to production
vercel --prod
```

---

## Part 2: Deploy Frontend

### Update Frontend API URL

Before deploying frontend, update the API URL:

1. **Create environment file** `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   ```

2. **Update ChatInterface.js** to use environment variable:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
   ```

### Method A: Using Vercel Dashboard

1. **Import Frontend Repository**
   - Go to Vercel Dashboard
   - Click "Add New" → "Project"
   - Select your repository
   - Choose the `frontend` folder as root directory

2. **Configure Frontend Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Your app will be live at `https://your-app.vercel.app`

### Method B: Using Vercel CLI

```bash
# Navigate to frontend folder
cd frontend

# Create production env file
echo "REACT_APP_API_URL=https://your-backend-url.vercel.app/api" > .env.production

# Deploy
vercel

# Follow prompts similar to backend

# Deploy to production
vercel --prod
```

---

## Part 3: Update CORS Settings

After deploying both frontend and backend:

1. **Update backend CORS** in `backend/server.js`:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-frontend-app.vercel.app'
     ],
     credentials: true
   }));
   ```

2. **Redeploy backend**:
   ```bash
   cd backend
   vercel --prod
   ```

---

## Part 4: Configure Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel

---

## Important Notes

### Backend Limitations on Vercel

⚠️ **Vercel Serverless Functions have limitations:**
- **10 second timeout** on Hobby plan (60s on Pro)
- **Stateless** - uploaded files won't persist between requests
- **Memory limits** - 1024 MB on Hobby plan

### Recommended Alternative for Backend

For production use with file uploads and vector storage, consider:

1. **Railway.app** - Better for Node.js backends with file storage
2. **Render.com** - Free tier with persistent storage
3. **Heroku** - Traditional hosting with add-ons
4. **AWS EC2** or **DigitalOcean** - Full control

### Using Railway for Backend (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Initialize and deploy
railway init
railway up

# Add environment variables in Railway dashboard
```

---

## Environment Variables Checklist

### Backend
- ✅ `GOOGLE_API_KEY` - Your Google Gemini API key
- ✅ `PORT` - 5000 (or leave empty for Vercel)
- ✅ `NODE_ENV` - production

### Frontend
- ✅ `REACT_APP_API_URL` - Your backend URL

---

## Testing Deployment

1. **Test Backend API**:
   ```bash
   curl https://your-backend-url.vercel.app/health
   ```

2. **Test Frontend**:
   - Open `https://your-frontend-app.vercel.app`
   - Try uploading a document
   - Ask a question

---

## Troubleshooting

### Backend Issues

**Problem**: API timeout errors
- **Solution**: Use Railway/Render instead of Vercel for backend

**Problem**: CORS errors
- **Solution**: Add frontend URL to CORS whitelist in server.js

**Problem**: Environment variables not working
- **Solution**: Check Vercel dashboard → Settings → Environment Variables

### Frontend Issues

**Problem**: Can't connect to backend
- **Solution**: Verify `REACT_APP_API_URL` is correct

**Problem**: Build fails
- **Solution**: Check Node version compatibility, run `npm install` locally first

---

## Continuous Deployment

Once connected to Git:
- **Push to main branch** → Auto-deploys to production
- **Push to other branches** → Creates preview deployments
- **Pull requests** → Automatic preview URLs

---

## Monitoring

1. **Vercel Dashboard** - View logs, analytics, and performance
2. **Error Tracking** - Consider adding Sentry for error monitoring
3. **Analytics** - Vercel Analytics available on Pro plan

---

## Cost Considerations

### Vercel Pricing
- **Hobby (Free)**: 
  - 100 GB bandwidth/month
  - Serverless function execution limits
  - Good for demos/testing

- **Pro ($20/month)**:
  - 1 TB bandwidth
  - Better function limits
  - Team collaboration

### Recommended Setup
- **Frontend**: Vercel (Free tier is fine)
- **Backend**: Railway/Render (Free tier with better limits)

---

## Security Checklist

- ✅ Never commit `.env` files
- ✅ Use environment variables for API keys
- ✅ Enable CORS only for your domains
- ✅ Add rate limiting for production
- ✅ Validate file uploads (size, type)
- ✅ Sanitize user inputs

---

## Next Steps

1. Deploy backend to Railway/Render
2. Deploy frontend to Vercel
3. Update API URL in frontend
4. Test thoroughly
5. Set up custom domain
6. Monitor performance
7. Add error tracking

---

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

---

**Good luck with your deployment! 🚀**
