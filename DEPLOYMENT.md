# 🚀 Deploying CardioAI to Render.com

This guide provides step-by-step instructions to deploy both the **FastAPI Backend** and the **React Frontend** to [Render.com](https://render.com) for free.

---

## 📌 Prerequisites

1. Create a free account on [Render.com](https://render.com).
2. Commit and push your `Cardio AI` project code to a GitHub repository:
   ```bash
   git add .
   git commit -m "Prepare CardioAI for deployment"
   git push origin main
   ```

---

## ⚡ Option 1: One-Click Blueprint Deployment (Recommended)

Render can automatically configure both the backend and frontend using the included [`render.yaml`](../render.yaml) file.

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> Select **Blueprint**.
3. Connect your GitHub repository (`Cardio AI`).
4. Render will detect `render.yaml` and auto-configure two services:
   - `cardio-ai-backend` (FastAPI Python Web Service)
   - `cardio-ai-frontend` (React Static Site)
5. Click **Apply**. Render will build and deploy both services automatically!

---

## 🛠️ Option 2: Manual Deployment Step-by-Step

### Step 1: Deploy the FastAPI Backend (Web Service)

1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository** and connect your repo.
3. Configure the backend settings:
   - **Name**: `cardio-ai-backend`
   - **Region**: Choose your preferred location (e.g., Singapore, Oregon, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r Backend/requirements.txt`
   - **Start Command**: `cd Backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Click **Create Web Service**.
5. Once deployment completes, copy your backend URL (e.g. `https://cardio-ai-backend.onrender.com`).

---

### Step 2: Deploy the React Frontend (Static Site)

1. On the Render Dashboard, click **New +** -> **Static Site**.
2. Connect the same GitHub repository.
3. Configure the frontend settings:
   - **Name**: `cardio-ai-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, click **Add Environment Variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://cardio-ai-backend.onrender.com` *(Paste your backend URL from Step 1)*
5. Click **Create Static Site**.

---

## 🔄 Rewrites for React Router (Single Page App)

If you navigate directly to subpages, add a rewrite rule under **Redirects/Rewrites** in your Frontend Static Site settings:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: `Rewrite`

---

## 🌐 Option 3: Deploying Frontend to Netlify

You can also host your React Frontend on **Netlify** while keeping your FastAPI Backend running on Render.

### Step 1: Push Code to GitHub
Ensure `frontend/public/_redirects` and `frontend/netlify.toml` are committed to your GitHub repo:
```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

### Step 2: Connect GitHub Repository to Netlify
1. Log in to [Netlify App](https://app.netlify.com).
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and authorize Netlify.
4. Select your **`Cardio AI`** repository.

### Step 3: Configure Netlify Build Settings
Fill in the deployment fields:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist` (or `dist` if base directory is set to `frontend`)

### Step 4: Set Environment Variable (Backend Connection)
1. Click **Environment Variables** -> **Add a variable** (or Site Configuration -> Environment Variables).
2. Set the following key and value:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://cardio-ai-backend.onrender.com` *(Your FastAPI backend URL on Render)*
3. Click **Deploy cardio-ai-frontend** (or **Deploy site**).

Netlify will build your Vite app and give you a live URL (e.g. `https://cardio-ai-studio.netlify.app`)!

---

## 🎉 Verification

1. Open your frontend Netlify URL (e.g. `https://cardio-ai-studio.netlify.app`).
2. Verify that the header shows **`FastAPI Connected`** with a green glowing indicator!
3. Select a preset or adjust biometrics and click **"Predict Cardiovascular Risk"** to test live cloud predictions.
