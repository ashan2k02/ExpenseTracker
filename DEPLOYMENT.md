# 🚀 Free Deployment Guide - Personal Expense Tracker

## Overview

This guide will help you deploy the Expense Tracker application for **FREE** using:

| Component | Service | Free Tier |
|-----------|---------|-----------|
| **Frontend** | Vercel | Unlimited |
| **Backend** | Render | 750 hrs/month |
| **Database** | TiDB Cloud | 5GB free |

---

## Step 1: Set Up Free MySQL Database (TiDB Cloud)

### 1.1 Create TiDB Account
1. Go to [tidbcloud.com](https://tidbcloud.com/)
2. Click **"Start Free"** → Sign up with GitHub/Google
3. Select **"Serverless"** tier (FREE)

### 1.2 Create a Cluster
1. Click **"Create Cluster"**
2. Choose **Serverless** (Free)
3. Select a region close to you
4. Name: `expense-tracker`
5. Click **Create Cluster**

### 1.3 Get Connection Details
1. Click on your cluster
2. Click **"Connect"** → **"General"**
3. Copy the connection string or note:
   - **Host**: `gateway01.xxx.prod.aws.tidbcloud.com`
   - **Port**: `4000`
   - **User**: Your username (e.g., `xxxxx.root`)
   - **Password**: Click "Generate Password"

### 1.4 Create Database
1. Click **"SQL Editor"** in TiDB Dashboard
2. Run:
```sql
CREATE DATABASE expense_tracker;
```

### 1.5 Import Schema
In SQL Editor, paste and run the contents of `backend/database.sql`

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com/)
2. Sign up with GitHub

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `ashan2k02/ExpenseTracker`
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `expense-tracker-api` |
| **Region** | Singapore or closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 2.3 Add Environment Variables
Click **"Environment"** and add:

```
PORT=10000
NODE_ENV=production
DB_HOST=gateway01.xxx.prod.aws.tidbcloud.com
DB_PORT=4000
DB_NAME=expense_tracker
DB_USER=xxxxx.root
DB_PASSWORD=your-tidb-password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Your API URL: `https://expense-tracker-api.onrender.com`

### 2.5 Test Backend
```bash
curl https://expense-tracker-api.onrender.com/api/health
# Should return: {"status":"OK","timestamp":"..."}
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com/)
2. Sign up with GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import from GitHub: `ashan2k02/ExpenseTracker`
3. Configure:

| Setting | Value |
|---------|-------|
| **Project Name** | `expense-tracker` |
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.3 Add Environment Variable
Click **"Environment Variables"** and add:

```
VITE_API_URL=https://expense-tracker-api.onrender.com/api
```

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for build (1-2 minutes)
3. Your app URL: `https://expense-tracker-xxx.vercel.app`

### 3.5 Update Backend CORS
Go back to Render Dashboard:
1. Open your backend service
2. Go to **Environment**
3. Update `FRONTEND_URL` to your Vercel URL
4. Render will auto-redeploy

---

## Step 4: Verify Deployment

### Test the Full Application
1. Open your Vercel URL
2. Try to register a new account
3. Login with the account
4. Add some expenses
5. Check dashboard charts

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| CORS Error | Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly |
| Database connection failed | Check TiDB credentials, ensure database exists |
| 502 Bad Gateway | Backend is still starting (Render free tier sleeps after 15 min inactivity) |
| Build failed | Check build logs for missing dependencies |

---

## Free Tier Limitations

### Render (Backend)
- ⚠️ **Sleeps after 15 min inactivity** (first request takes ~30s to wake up)
- 750 hours/month (enough for ~31 days continuous)
- 512MB RAM, 0.1 CPU

### TiDB Cloud (Database)
- 5GB storage
- 50M Request Units/month
- Serverless scaling

### Vercel (Frontend)
- 100GB bandwidth/month
- Unlimited projects
- Custom domains supported

---

## Alternative Free Databases

### Option 2: PlanetScale (MySQL)
1. Go to [planetscale.com](https://planetscale.com/)
2. Create free database
3. Get connection string

### Option 3: Railway (PostgreSQL)
If you prefer PostgreSQL:
1. Go to [railway.app](https://railway.app/)
2. Create PostgreSQL database
3. Modify Sequelize dialect to 'postgres'

### Option 4: Neon (PostgreSQL)
1. Go to [neon.tech](https://neon.tech/)
2. Free tier: 0.5GB storage

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domain
2. Add domain (requires paid plan for custom domains)

---

## Quick Reference

```
Frontend URL: https://expense-tracker-xxx.vercel.app
Backend URL:  https://expense-tracker-api.onrender.com
API Base:     https://expense-tracker-api.onrender.com/api

API Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me
- GET  /api/expenses
- POST /api/expenses
- GET  /api/reports/dashboard
- GET  /api/budgets
```

---

## Updating Your Deployment

### Push Changes
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Both Vercel and Render will automatically redeploy when you push to `main`.

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **TiDB Docs**: https://docs.pingcap.com/tidbcloud

---

**Your expense tracker is now live! 🎉**
