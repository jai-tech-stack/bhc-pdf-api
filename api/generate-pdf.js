/**
 * api/generate-pdf.js
 * Vercel serverless function / API route to generate PDFs using @sparticuz/chromium + puppeteer-core.
 *
 * POST JSON body:
 * {
 *   "htmlContent": "<html>...</html>",
 *   "fileName": "Brand_Report.pdf"
 * }
 *
 * Responds with: application/pdf stream (200) on success, JSON {error, message} on failure.
 */
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

/**
 * Helper: safe send error JSON
 */
function sendJsonError(res, status, error, message) {
  res.status(status).json({ error, message });
}

export default async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://brandhealthchecker.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJsonError(res, 405, 'method_not_allowed', 'Only POST allowed');
  }

  const body = (typeof req.body === 'object') ? req.body : {};
  const htmlContent = body.htmlContent || '';
  const fileName = body.fileName || `report-${new Date().toISOString().slice(0,10)}.pdf`;

  if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length === 0) {
    return sendJsonError(res, 400, 'bad_request', 'Missing htmlContent in request body');
  }

  let browser = null;

  try {
    // Launch puppeteer-core with @sparticuz/chromium - OPTIMIZED FOR VERCEL
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();

    // Optional: set a reasonable user agent
    await page.setUserAgent('BrandHealthCheckerBot/1.0 (+https://brandhealthchecker.com)');

    // Set HTML content and wait for load (faster than networkidle0)
    await page.setContent(htmlContent, { waitUntil: 'load', timeout: 8000 });

    // Give fonts/images a brief moment
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' }
    });

    // Close page early
    try { await page.close(); } catch (e) { /* ignore */ }

    // Response headers for direct download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));

    // Send binary PDF
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);

    // Common cause: missing native libs or chromium launch failed
    const msg = (err && err.message) ? err.message : String(err);

    // If this looks like a chromium library error provide actionable message
    if (msg.includes('libnss3') || msg.includes('error while loading shared libraries') || msg.includes('Failed to launch the browser process')) {
      return sendJsonError(res, 500, 'chromium_launch_failed',
        'Chromium failed to launch. Using @sparticuz/chromium on Vercel serverless. See https://pptr.dev/troubleshooting');
    }

    return sendJsonError(res, 500, 'pdf_generation_failed', msg);
  } finally {
    if (browser) {
      try { await browser.close(); } catch (e) { /* ignore */ }
    }
  }
};