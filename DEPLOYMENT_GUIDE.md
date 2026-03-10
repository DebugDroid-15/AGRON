# AGRON Dashboard - GitHub & Vercel Deployment Guide

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface
1. Go to https://github.com/new
2. Create a new repository named `agron-iot-dashboard`
3. Set it as **Public** (for Vercel auto-deployment)
4. Do NOT initialize with README, .gitignore, or license (we have these)
5. Click "Create repository"

### Option B: Using GitHub CLI
```bash
gh repo create agron-iot-dashboard --public --source=. --remote=origin --push
```

## Step 2: Push Local Repository to GitHub

After creating the repository, run these commands:

```bash
cd c:\Downloads\agronwebdasb

# Add GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/agron-iot-dashboard.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

## Step 3: Deploy on Vercel

### Option A: Using Vercel Web Interface (Recommended)

1. Go to https://vercel.com
2. Sign up or log in with GitHub
3. Click "Add New..." → "Project"
4. Select your `agron-iot-dashboard` repository
5. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Click "Deploy"
7. Wait for deployment to complete (usually 2-3 minutes)

### Option B: Using Vercel CLI

```bash
npm install -g vercel
cd c:\Downloads\agronwebdasb
vercel --prod
```

Follow the prompts to link to your GitHub repository.

## Step 4: Environment Variables (if needed)

If deploying to Vercel:
1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add any required environment variables (currently none needed for this project)

## Step 5: Verify Deployment

After deployment completes:
- Vercel will provide you a URL (usually `https://agron-iot-dashboard.vercel.app`)
- Every push to the main branch will auto-deploy
- Test the dashboard at `/dashboard` route

## Automatic Deployments

Once connected, any push to your GitHub repository will automatically trigger a new Vercel deployment:

```bash
# Make changes locally
git add .
git commit -m "Update: Add new feature"
git push origin main

# Vercel will automatically build and deploy
```

## Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Port Issues
- Vercel automatically handles port configuration
- No need to specify port in production

### GitHub Connection Issues
- Make sure you authorized Vercel to access GitHub
- Check repository permissions in GitHub settings

## Project Structure for Vercel

```
agron-iot-dashboard/
├── app/              (Next.js App Router)
├── components/       (React components)
├── store/            (Zustand state)
├── public/           (Static assets)
├── package.json      (Dependencies)
├── tsconfig.json     (TypeScript config)
├── tailwind.config.js (TailwindCSS config)
├── next.config.js    (Next.js config)
├── .gitignore        (Git ignore rules)
└── .git/             (Git repository)
```

## Key Files for Deployment

✅ Already configured:
- `next.config.js` - Next.js optimization
- `package.json` - All dependencies listed
- `.gitignore` - Node modules excluded
- `tsconfig.json` - TypeScript for Node module resolution

## Performance Optimizations for Production

The project includes:
- ✓ Image optimization
- ✓ Code splitting by route
- ✓ CSS minification via TailwindCSS
- ✓ JavaScript bundle analysis ready

## Next Steps After Deployment

1. **Add Custom Domain** (Optional)
   - Go to Vercel Project Settings
   - Add your custom domain

2. **Set Up CI/CD**
   - Automatic deployments on push ✓ (Already configured)
   - Preview deployments on pull requests ✓ (Already configured)

3. **Monitor Performance**
   - Use Vercel Analytics
   - Check Core Web Vitals

## Support Links

- GitHub Docs: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Your AGRON Dashboard will be live and accessible worldwide once deployment completes!**
