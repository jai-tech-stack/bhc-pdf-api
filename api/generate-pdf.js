/**
 * api/generate-pdf.js
 * Vercel serverless function / API route to generate PDFs using chrome-aws-lambda + puppeteer-core.
 *
 * POST JSON body:
 * {
 *   "htmlContent": "<html>...</html>",
 *   "fileName": "Brand_Report.pdf"
 * }
 *
 * Responds with: application/pdf stream (200) on success, JSON {error, message} on failure.
 */
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

/**
 * Helper: safe send error JSON
 */
function sendJsonError(res, status, error, message) {
  res.status(status).json({ error, message });
}

export default async (req, res) => {
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
    // Acquire executablePath for the serverless chromium binary
    const executablePath = await chromium.executablePath || null;

    // Launch puppeteer-core with chrome-aws-lambda args
    const launchOptions = {
      args: (chromium.args || []).concat(['--disable-dev-shm-usage']),
      defaultViewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
      headless: chromium.headless,
      executablePath: executablePath || undefined,
      // Ensure we don't hang forever
      timeout: 30000
    };

    // If executablePath is missing, try to fall back to puppeteer's bundled chromium (if available),
    // but normally in serverless we expect chrome-aws-lambda to provide executablePath.
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Optional: set a reasonable user agent
    await page.setUserAgent('BrandHealthCheckerBot/1.0 (+https://brandhealthchecker.com)');

    // Set HTML content and wait for network idle
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });

    // Give fonts/images a moment (optional)
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 200);
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
        'Chromium failed to launch. Use chrome-aws-lambda + puppeteer-core on serverless or install system libraries. See https://pptr.dev/troubleshooting');
    }

    return sendJsonError(res, 500, 'pdf_generation_failed', msg);
  } finally {
    if (browser) {
      try { await browser.close(); } catch (e) { /* ignore */ }
    }
  }
};