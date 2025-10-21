# Brand Health Check PDF API

Node.js + Puppeteer serverless API for generating PDF reports.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- [Vercel Account](https://vercel.com) (Free)
- [Vercel CLI](https://vercel.com/download) (Optional but recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub:**
   ```bash
   cd bhc-pdf-api
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create bhc-pdf-api --public --source=. --push
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Done! ✅

3. **Get your API URL:**
   - After deployment, you'll get a URL like: `https://your-project.vercel.app`
   - Your PDF API endpoint: `https://your-project.vercel.app/api/generate-pdf`

### Option 2: Deploy via CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd bhc-pdf-api
   vercel --prod
   ```

4. **Copy the deployment URL** (e.g., `https://bhc-pdf-api.vercel.app`)

## 📝 Update Your Frontend

After deployment, update your frontend HTML file:

```javascript
// Replace the downloadPDFReportNew function with:
async function downloadPDFReportNew(opts = {}) {
  const API_URL = 'https://YOUR-PROJECT.vercel.app/api/generate-pdf'; // 👈 Update this!
  
  try {
    showOverlay('Generating your Brand Health Report...');
    
    const htmlContent = generatePDFHTML(); // Your HTML template
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent: htmlContent,
        assessmentData: currentState,
        fileName: `Brand_Health_Report_${new Date().toISOString().slice(0,10)}.pdf`
      })
    });
    
    if (!response.ok) {
      throw new Error('PDF generation failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Brand_Health_Report_${new Date().toISOString().slice(0,10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    updateOverlay('Report generated successfully!');
    setTimeout(() => removeOverlay(), 700);
    
  } catch (error) {
    console.error('PDF Error:', error);
    removeOverlay();
    alert('Failed to generate PDF. Please try again.');
  }
}
```

## 🔧 Configuration

- **Memory:** 3008 MB (configured in `vercel.json`)
- **Timeout:** 60 seconds
- **Format:** A4
- **CORS:** Enabled for all origins

## 📦 Dependencies

- `puppeteer-core`: PDF generation
- `chrome-aws-lambda`: Chromium for serverless environments
- `@vercel/og`: Vercel optimizations

## 🐛 Troubleshooting

### PDF Generation Timeout
- Increase `maxDuration` in `vercel.json`
- Reduce HTML complexity
- Optimize images

### Memory Issues
- Increase `memory` in `vercel.json` (max 3008 MB on free tier)

### CORS Errors
- Check API URL in frontend
- Verify CORS headers in API response

## 💰 Cost

**Vercel Free Tier:**
- ✅ 100 GB bandwidth/month
- ✅ Serverless function invocations
- ✅ Enough for thousands of PDFs/month

**If you exceed free tier:**
- Pro: $20/month (unlimited bandwidth)

## 📞 Support

For issues, check Vercel logs:
```bash
vercel logs
```

