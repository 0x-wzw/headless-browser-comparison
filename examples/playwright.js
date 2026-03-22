/**
 * Playwright Example
 * 
 * Microsoft's cross-browser automation framework.
 * Best for: Modern web apps, cross-browser testing, reliable automation.
 * 
 * Installation:
 *   npm install playwright
 *   npx playwright install
 */

const { chromium, firefox, webkit } = require('playwright');

// Basic navigation example
async function basicExample() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to example.com...');
    await page.goto('https://example.com');
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'example-playwright.png' });
    
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

// AI Agent Pattern: Smart waiting and interaction
async function smartAgentExample(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; AI-Agent/1.0)'
  });
  const page = await context.newPage();
  
  try {
    // Navigate with timeout
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for specific element (auto-waiting)
    await page.waitForSelector('article, [role="main"], main', { timeout: 10000 });
    
    // Extract structured data
    const data = await page.evaluate(() => {
      const article = document.querySelector('article') || 
                     document.querySelector('[role="main"]') || 
                     document.querySelector('main');
      
      return {
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          level: h.tagName,
          text: h.textContent.trim()
        })),
        links: Array.from(document.querySelectorAll('a[href^="http"]')).slice(0, 10).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        })),
        articleText: article ? article.innerText.substring(0, 1000) : null
      };
    });
    
    return data;
    
  } finally {
    await browser.close();
  }
}

// Cross-browser test example
async function crossBrowserExample(url) {
  const browsers = [
    { name: 'Chromium', launcher: chromium },
    { name: 'Firefox', launcher: firefox },
    { name: 'WebKit', launcher: webkit }
  ];
  
  const results = {};
  
  for (const { name, launcher } of browsers) {
    console.log(`Testing ${name}...`);
    const browser = await launcher.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      const startTime = Date.now();
      
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const title = await page.title();
      
      results[name] = {
        title,
        loadTime: Date.now() - startTime,
        success: true
      };
    } catch (error) {
      results[name] = {
        error: error.message,
        success: false
      };
    } finally {
      await browser.close();
    }
  }
  
  return results;
}

// Network interception example (useful for AI agents)
async function networkInterceptExample(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Intercept API responses
  const apiResponses = [];
  
  page.on('response', async (response) => {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          data
        });
      } catch (e) {
        // Not JSON
      }
    }
  });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait a bit for XHR/fetch requests
    await page.waitForTimeout(2000);
    
    return {
      title: await page.title(),
      apiResponses: apiResponses.slice(0, 5) // Limit results
    };
    
  } finally {
    await browser.close();
  }
}

// Mobile emulation example
async function mobileExample(url) {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      ...require('playwright').devices['iPhone 14'],
      viewport: { width: 390, height: 844 }
    });
    
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: 'mobile-screenshot.png' });
    
    return {
      title: await page.title(),
      viewport: '390x844 (iPhone 14)'
    };
    
  } finally {
    await browser.close();
  }
}

// AI Agent Pattern: Extract and interact with forms
async function formInteractionExample(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Find all form elements
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map(form => ({
        action: form.action,
        method: form.method,
        inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          required: input.required,
          placeholder: input.placeholder
        }))
      }));
    });
    
    // Find all buttons
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, input[type="submit"]')).map(btn => ({
        text: btn.textContent || btn.value,
        type: btn.type
      }));
    });
    
    return { forms, buttons };
    
  } finally {
    await browser.close();
  }
}

// Session persistence (for multi-step agent workflows)
async function persistentSessionExample() {
  const browser = await chromium.launch({ headless: true });
  
  // Create context with storage state
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Login (hypothetical)
    await page.goto('https://example.com/login');
    // await page.fill('#username', 'user');
    // await page.fill('#password', 'pass');
    // await page.click('#login-button');
    
    // Save storage state for later
    const storageState = await context.storageState();
    
    // Step 2: Use saved state in new context
    const newContext = await browser.newContext({ storageState });
    const newPage = await newContext.newPage();
    
    await newPage.goto('https://example.com/dashboard');
    
    return {
      loggedIn: true,
      cookies: storageState.cookies?.length || 0
    };
    
  } finally {
    await browser.close();
  }
}

// Export functions for use in other modules
module.exports = {
  basicExample,
  smartAgentExample,
  crossBrowserExample,
  networkInterceptExample,
  mobileExample,
  formInteractionExample,
  persistentSessionExample
};

// Run examples if executed directly
if (require.main === module) {
  (async () => {
    console.log('=== Playwright Examples ===\n');
    
    console.log('1. Basic Example:');
    await basicExample();
    
    console.log('\n2. Smart Agent Example:');
    const agentData = await smartAgentExample('https://example.com');
    console.log('Extracted data:', JSON.stringify(agentData, null, 2));
    
    console.log('\n3. Cross-browser Test:');
    const crossBrowserResults = await crossBrowserExample('https://example.com');
    console.log('Cross-browser results:', JSON.stringify(crossBrowserResults, null, 2));
    
  })().catch(console.error);
}
