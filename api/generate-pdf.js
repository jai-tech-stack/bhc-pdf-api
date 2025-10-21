const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

// Enable streaming to bypass 4.5MB payload limit
export const config = {
  maxDuration: 60,
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser = null;

  try {
    const { htmlContent, fileName } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('[PDF] Starting generation...');

    // Optimize chromium args for lower memory usage
    const chromiumArgs = [
      ...chromium.args,
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
      '--disable-setuid-sandbox',
      '--disable-software-rasterizer',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ];

    browser = await puppeteer.launch({
      args: chromiumArgs,
      defaultViewport: {
        width: 1280,
        height: 720,
        deviceScaleFactor: 1.5, // Balance between quality and memory
      },
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Reduce memory by disabling unnecessary features
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      // Block unnecessary resources to save memory
      if (['font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 25000,
    });

    console.log('[PDF] Content loaded, generating PDF...');

    // Set response headers for streaming
    const sanitizedFileName = (fileName || 'report')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .replace(/\.pdf$/i, '') + '.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
    res.setHeader('Transfer-Encoding', 'chunked');

    // Generate PDF as stream to avoid memory issues
    const pdfStream = await page.createPDFStream({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      preferCSSPageSize: false,
    });

    // Pipe the stream directly to response
    pdfStream.pipe(res);

    pdfStream.on('end', async () => {
      console.log('[PDF] Generation complete');
      await browser.close();
    });

    pdfStream.on('error', async (error) => {
      console.error('[PDF] Stream error:', error);
      await browser.close();
      if (!res.headersSent) {
        res.status(500).json({ error: 'PDF generation failed' });
      }
    });

  } catch (error) {
    console.error('[PDF] Generation error:', error);
    console.error('[PDF] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('[PDF] Browser close error:', closeError);
      }
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate PDF',
        message: error.message,
        type: error.name
      });
    }
  }
};