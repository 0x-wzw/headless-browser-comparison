/**
 * Puppeteer Example
 * 
 * Google's Chrome DevTools Protocol library for Node.js.
 * Best for: Chrome automation, PDF generation, screenshots, DevTools integration.
 * 
 * Installation:
 *   npm install puppeteer
 */

const puppeteer = require('puppeteer');

// Basic navigation example
async function basicExample() {
  const browser = await puppeteer.launch({
    headless: 'new', // Use new headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'example-puppeteer.png' });
    
    console.log('Extracting title...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('Extracting h1 text...');
    const h1Text = await page.$eval('h1', el => el.textContent);
    console.log('H1 text:', h1Text);
    
  } finally {
    await browser.close();
  }
}

// AI Agent Pattern: Content extraction
async function extractContentAI(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (compatible; AI-Agent/1.0)');
    
    // Navigate with timeout
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract comprehensive page data
    const pageData = await page.evaluate(() => {
      const readability = () => {
        // Simple readability-like extraction
        const article = document.querySelector('article') || 
                       document.querySelector('[role="main"]') || 
                       document.querySelector('main') ||
                       document.querySelector('.content') ||
                       document.body;
        
        // Remove script/style elements
        const scripts = article.querySelectorAll('script, style, nav, header, footer');
        scripts.forEach(el => el.remove());
        
        return article.innerText.trim();
      };
      
      return {
        title: document.title,
        meta: {
          description: document.querySelector('meta[name="description"]')?.content || null,
          author: document.querySelector('meta[name="author"]')?.content || null,
          keywords: document.querySelector('meta[name="keywords"]')?.content || null
        },
        headings: {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()).slice(0, 5)
        },
        content: readability(),
        links: Array.from(document.querySelectorAll('a[href^="http"]'))
          .slice(0, 10)
          .map(a => ({
            text: a.textContent.trim().substring(0, 100),
            href: a.href
          })),
        images: Array.from(document.querySelectorAll('img[src]'))
          .slice(0, 5)
          .map(img => ({
            src: img.src,
            alt: img.alt
          }))
      };
    });
    
    return pageData;
    
  } finally {
    await browser.close();
  }
}

// PDF generation example
async function generatePDF(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    return pdfBuffer;
    
  } finally {
    await browser.close();
  }
}

// Network monitoring (AI agent pattern)
async function monitorNetwork(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect network data
  const networkData = {
    requests: [],
    responses: [],
    errors: []
  };
  
  // Request interception
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    networkData.requests.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType()
    });
    req.continue();
  });
  
  // Response tracking
  page.on('response', (res) => {
    networkData.responses.push({
      url: res.url(),
      status: res.status(),
      headers: res.headers()
    });
  });
  
  // Error tracking
  page.on('requestfailed', (req) => {
    networkData.errors.push({
      url: req.url(),
      failure: req.failure()?.errorText
    });
  });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for potential async requests
    await page.waitForTimeout(2000);
    
    return {
      title: await page.title(),
      summary: {
        totalRequests: networkData.requests.length,
        successful: networkData.responses.filter(r => r.status < 400).length,
        failed: networkData.errors.length
      },
      apiCalls: networkData.requests
        .filter(r => r.resourceType === 'xhr' || r.resourceType === 'fetch')
        .map(r => r.url)
    };
    
  } finally {
    await browser.close();
  }
}

// Stealth mode (avoid detection)
async function stealthExample(url) {
  // Note: puppeteer-extra-stealth is recommended for production
  // npm install puppeteer-extra puppeteer-extra-plugin-stealth
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  try {
    // Stealth measures
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Override navigator properties
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Check if detected
    const detection = await page.evaluate(() => {
      return {
        webdriver: navigator.webdriver,
        userAgent: navigator.userAgent,
        plugins: navigator.plugins?.length
      };
    });
    
    return {
      title: await page.title(),
      detectionCheck: detection
    };
    
  } finally {
    await browser.close();
  }
}

// Form interaction example
async function interactWithForm(url, formData) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Fill form fields
    for (const [selector, value] of Object.entries(formData)) {
      await page.type(selector, value, { delay: 50 });
    }
    
    // Submit form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"], input[type="submit"]')
    ]);
    
    return {
      success: true,
      currentUrl: page.url(),
      title: await page.title()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Cookie/session management
async function sessionManagementExample() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Set cookies before navigation
    await page.setCookie(
      { name: 'session_id', value: 'abc123', domain: '.example.com' },
      { name: 'preferences', value: 'dark_mode', domain: '.example.com' }
    );
    
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    // Get all cookies
    const cookies = await page.cookies();
    
    // Clear specific cookies
    await page.deleteCookie({ name: 'session_id', domain: '.example.com' });
    
    return { cookies: cookies.length };
    
  } finally {
    await browser.close();
  }
}

// Export functions
module.exports = {
  basicExample,
  extractContentAI,
  generatePDF,
  monitorNetwork,
  stealthExample,
  interactWithForm,
  sessionManagementExample
};

// Run examples if executed directly
if (require.main === module) {
  (async () => {
    console.log('=== Puppeteer Examples ===\n');
    
    console.log('1. Basic Example:');
    await basicExample();
    
    console.log('\n2. AI Content Extraction:');
    const content = await extractContentAI('https://example.com');
    console.log('Extracted:', JSON.stringify(content, null, 2).substring(0, 500) + '...');
    
  })().catch(console.error);
}
