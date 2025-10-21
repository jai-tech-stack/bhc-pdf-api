# 🚀 Quick Deploy Guide - 5 Minutes!

## Step 1: Deploy API to Vercel (2 minutes)

### Method A: GitHub + Vercel Dashboard (Easiest)

1. **Create GitHub Repository:**
   - Go to [github.com](https://github.com/new)
   - Create new repository: `bhc-pdf-api`
   - Don't initialize with README

2. **Push Code:**
   ```bash
   cd bhc-pdf-api
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/bhc-pdf-api.git
   git push -u origin main
   ```

3. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select `bhc-pdf-api`
   - Click "Deploy"
   - ✅ Done! Copy your API URL (e.g., `https://bhc-pdf-api.vercel.app`)

### Method B: Vercel CLI (For Developers)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy
cd bhc-pdf-api
vercel --prod

# Copy the production URL
```

## Step 2: Update Frontend (3 minutes)

1. **Open your `bhclive.html` file**

2. **Find the `downloadPDFReportNew` function** (around line 3000+)

3. **Replace it with the code from `frontend-update.js`**

4. **Update the API URL:**
   ```javascript
   const PDF_API_URL = 'https://YOUR-PROJECT.vercel.app/api/generate-pdf';
   //                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   //                   Replace with your actual Vercel URL!
   ```

5. **Remove the old jsPDF loading code** (if any):
   ```javascript
   // Delete these lines:
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
   ```

6. **Save and upload `bhclive.html` to Hostinger**

## Step 3: Test (1 minute)

1. Open your website
2. Complete the assessment
3. Click "Download PDF"
4. PDF should download! 🎉

## 📋 Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed on Vercel
- [ ] Copied deployment URL
- [ ] Updated `PDF_API_URL` in bhclive.html
- [ ] Uploaded bhclive.html to Hostinger
- [ ] Tested PDF generation

## 🐛 Troubleshooting

### "Failed to generate PDF"
- Check browser console for errors
- Verify API URL is correct
- Check Vercel deployment logs: `vercel logs`

### CORS Error
- API has CORS enabled by default
- Check Network tab in DevTools
- Verify the request URL matches deployment URL

### Timeout
- Free tier has 10-second timeout
- Upgrade to Pro for 60-second timeout ($20/month)
- Or optimize PDF template

## 💰 Costs

**100% FREE** for:
- Up to 100GB bandwidth/month
- Serverless function executions
- Commercial use allowed

**Need more?**
- Vercel Pro: $20/month (unlimited bandwidth)
- Still cheaper than any PDF API service!

## 📞 Need Help?

1. Check Vercel logs: `vercel logs`
2. Check browser console errors
3. Test API directly: 
   ```bash
   curl -X POST https://YOUR-URL.vercel.app/api/generate-pdf \
     -H "Content-Type: application/json" \
     -d '{"htmlContent":"<h1>Test</h1>","fileName":"test.pdf"}'
   ```

---

## 🎯 What You Just Built

✅ Serverless PDF generation API  
✅ Scales automatically  
✅ No server maintenance  
✅ Works with Hostinger shared hosting  
✅ Professional-quality PDFs  
✅ Secure (no client-side generation)  

**Total Time:** ~5 minutes  
**Total Cost:** $0/month  
**Complexity:** Low  

Enjoy your new PDF system! 🚀

