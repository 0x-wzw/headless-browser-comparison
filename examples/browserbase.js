/**
 * Browserbase Example
 * 
 * AI-first cloud browser infrastructure.
 * Best for: Scale, stealth, session persistence, no infrastructure management.
 * 
 * Installation:
 *   npm install @browserbasehq/sdk
 * 
 * Requires BROWSERBASE_API_KEY environment variable.
 */

// Note: This example uses Playwright with Browserbase
// Install: npm install @browserbasehq/sdk playwright

const { chromium } = require('playwright');

// Browserbase configuration
const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY;
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;

// Browserbase CDP endpoint
const BROWSERBASE_CDP_URL = `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}`;

// Basic example
async function basicExample() {
  if (!BROWSERBASE_API_KEY) {
    console.log('BROWSERBASE_API_KEY not set. Running in demo mode.');
    console.log('Set your API key: export BROWSERBASE_API_KEY=your_key_here');
    return;
  }
  
  console.log('Connecting to Browserbase...');
  
  const browser = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'example-browserbase.png' });
    
    console.log('Extracting title...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('Extracting h1 text...');
    const h1Text = await page.locator('h1').textContent();
    console.log('H1 text:', h1Text);
    
  } finally {
    await browser.close();
  }
}

// AI Agent Pattern: Stealth browsing
async function stealthBrowsingExample(url) {
  if (!BROWSERBASE_API_KEY) {
    console.log('BROWSERBASE_API_KEY not set. Skipping stealth example.');
    return;
  }
  
  console.log('Connecting to Browserbase with stealth mode...');
  
  const browser = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
  
  try {
    // Create context with stealth settings
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Add stealth scripts
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      window.chrome = { runtime: {} };
    });
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Verify stealth
    const detection = await page.evaluate(() => ({
      webdriver: navigator.webdriver,
      plugins: navigator.plugins?.length,
      chrome: !!window.chrome
    }));
    
    console.log('Stealth check:', detection);
    
    return {
      title: await page.title(),
      detection,
      success: !detection.webdriver
    };
    
  } finally {
    await browser.close();
  }
}

// Session persistence example
async function sessionPersistenceExample() {
  if (!BROWSERBASE_API_KEY) {
    console.log('BROWSERBASE_API_KEY not set. Skipping session example.');
    return;
  }
  
  console.log('Creating persistent session...');
  
  // First session - login (simulated)
  const browser1 = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
  
  let sessionId;
  
  try {
    const context = await browser1.newContext();
    const page = await context.newPage();
    
    await page.goto('https://example.com');
    
    // Simulate login actions
    console.log('Simulating login...');
    // await page.fill('#username', 'user');
    // await page.fill('#password', 'pass');
    // await page.click('#login');
    
    // Store session state
    const storageState = await context.storageState();
    sessionId = storageState.cookies?.find(c => c.name === 'session')?.value || 'demo-session';
    
    console.log('Session established:', sessionId);
    
  } finally {
    await browser1.close();
  }
  
  // Second session - resume with saved state
  console.log('Resuming session...');
  const browser2 = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
  
  try {
    // Browserbase maintains session on their end
    const context = await browser2.newContext();
    const page = await context.newPage();
    
    await page.goto('https://example.com/protected-page');
    
    return {
      resumed: true,
      sessionId,
      title: await page.title()
    };
    
  } finally {
    await browser2.close();
  }
}

// Multi-session scaling
async function multiSessionExample(urls) {
  if (!BROWSERBASE_API_KEY) {
    console.log('BROWSERBASE_API_KEY not set. Skipping multi-session example.');
    return;
  }
  
  console.log(`Running ${urls.length} parallel sessions...`);
  
  const results = await Promise.all(
    urls.map(async (url, index) => {
      const browser = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
      
      try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        const startTime = Date.now();
        await page.goto(url, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;
        
        return {
          index,
          url,
          title: await page.title(),
          loadTime,
          success: true
        };
      } catch (error) {
        return {
          index,
          url,
          error: error.message,
          success: false
        };
      } finally {
        await browser.close();
      }
    })
  );
  
  return {
    total: urls.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}

// Screenshot automation with Browserbase
async function screenshotAutomation(urls) {
  if (!BROWSERBASE_API_KEY) {
    console.log('BROWSERBASE_API_KEY not set. Skipping screenshot example.');
    return;
  }
  
  console.log(`Capturing ${urls.length} screenshots...`);
  
  const screenshots = [];
  
  for (const url of urls) {
    const browser = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const screenshotPath = `screenshot-${Date.now()}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      screenshots.push({
        url,
        path: screenshotPath,
        title: await page.title()
      });
      
    } finally {
      await browser.close();
    }
  }
  
  return screenshots;
}

// AI Agent Pattern: Structured data extraction
async function extractStructuredData(url) {
  if (!BROWSERBASE_API_KEY) {
    console.log('BROWSERBASE_API_KEY not set. Skipping extraction example.');
    return;
  }
  
  console.log('Extracting structured data...');
  
  const browser = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for dynamic content
    await page.waitForTimeout(2000);
    
    const data = await page.evaluate(() => {
      // Extract articles/blog posts
      const articles = Array.from(document.querySelectorAll('article, .post, .entry'))
        .slice(0, 5)
        .map(article => ({
          title: article.querySelector('h1, h2, .title')?.textContent?.trim() || null,
          content: article.innerText?.substring(0, 500) || null,
          links: Array.from(article.querySelectorAll('a')).map(a => a.href).slice(0, 3)
        }));
      
      // Extract navigation
      const navigation = Array.from(document.querySelectorAll('nav a, header a'))
        .map(a => ({
          text: a.textContent.trim(),
          href: a.href
        }));
      
      // Extract metadata
      const metadata = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        ogImage: document.querySelector('meta[property="og:image"]')?.content
      };
      
      return { articles, navigation, metadata };
    });
    
    return data;
    
  } finally {
    await browser.close();
  }
}

// Error handling and retry pattern
async function resilientFetch(url, maxRetries = 3) {
  if (!BROWSERBASE_API_KEY) {
    return { error: 'BROWSERBASE_API_KEY not set' };
  }
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const browser = await chromium.connectOverCDP(BROWSERBASE_CDP_URL);
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Set shorter timeout for faster retries
      page.setDefaultTimeout(15000);
      
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Wait for key element
      await page.waitForSelector('body', { timeout: 5000 });
      
      return {
        success: true,
        title: await page.title(),
        attempt
      };
      
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          error: error.message,
          attempts: maxRetries
        };
      }
      
      // Wait before retry
      await new Promise(r => setTimeout(r, 1000 * attempt));
    } finally {
      await browser.close();
    }
  }
}

// Export functions
module.exports = {
  basicExample,
  stealthBrowsingExample,
  sessionPersistenceExample,
  multiSessionExample,
  screenshotAutomation,
  extractStructuredData,
  resilientFetch
};

// Run examples if executed directly
if (require.main === module) {
  (async () => {
    console.log('=== Browserbase Examples ===\n');
    
    console.log('1. Basic Example:');
    await basicExample();
    
    if (BROWSERBASE_API_KEY) {
      console.log('\n2. Stealth Browsing:');
      const stealth = await stealthBrowsingExample('https://example.com');
      console.log('Stealth result:', stealth);
      
      console.log('\n3. Multi-session:');
      const multi = await multiSessionExample([
        'https://example.com',
        'https://httpbin.org/get',
        'https://jsonplaceholder.typicode.com/posts'
      ]);
      console.log('Multi-session results:', JSON.stringify(multi, null, 2));
    }
    
  })().catch(console.error);
}
