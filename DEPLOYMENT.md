# Deploy RFP Requirements Builder to Vercel

## Quick Deploy Steps

### 1. Go to Vercel
Visit [vercel.com](https://vercel.com) and sign in with your GitHub account.

### 2. Import Your Repository
1. Click **"Add New..."** → **"Project"**
2. Find and select **`rfp-requirements-builder`** from your GitHub repositories
3. Click **"Import"**

### 3. Configure Project Settings
Vercel will auto-detect Next.js settings:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `next build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4. Environment Variables (if needed)
If your app uses any environment variables (like API keys), add them in the **Environment Variables** section:
- Click **"Environment Variables"**
- Add any required variables (e.g., `OPENAI_API_KEY`, `NEXTAUTH_SECRET`, etc.)

### 5. Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at a URL like: `https://rfp-requirements-builder-xxx.vercel.app`

### 6. Custom Domain (Optional)
1. Go to **Settings** → **Domains**
2. Add your custom domain if you have one

## Post-Deployment Checklist

- [ ] Test the homepage loads correctly
- [ ] Test the RFP Builder flow
- [ ] Verify logos are displaying correctly
- [ ] Check API routes are working
- [ ] Test PDF generation (if applicable)

## Troubleshooting

### Build Errors
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18+ by default)

### Missing Files
- Ensure `public/` folder files are committed to Git
- Check `.gitignore` doesn't exclude necessary files

### API Routes Not Working
- Verify API routes are in `app/api/` directory
- Check environment variables are set correctly
- Review Vercel function logs in the dashboard

## Repository
GitHub: https://github.com/fahad-zakir/rfp-requirements-builder
