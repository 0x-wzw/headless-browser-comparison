/**
 * Selenium Example
 * 
 * The universal browser automation framework.
 * Best for: Cross-browser testing, legacy systems, WebDriver standard compliance.
 * 
 * Installation:
 *   npm install selenium-webdriver
 * 
 * Requires WebDriver binaries:
 *   - Chrome: chromedriver
 *   - Firefox: geckodriver
 *   - Safari: safaridriver (included with macOS)
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

// Basic navigation example
async function basicExample() {
  // Build Chrome driver with options
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    console.log('Navigating to example.com...');
    await driver.get('https://example.com');
    
    console.log('Taking screenshot...');
    await driver.takeScreenshot().then((data) => {
      require('fs').writeFileSync('example-selenium.png', data, 'base64');
    });
    
    console.log('Extracting title...');
    const title = await driver.getTitle();
    console.log('Page title:', title);
    
    console.log('Extracting h1 text...');
    const h1 = await driver.findElement(By.css('h1'));
    const h1Text = await h1.getText();
    console.log('H1 text:', h1Text);
    
  } finally {
    await driver.quit();
  }
}

// AI Agent Pattern: Wait strategies
async function smartWaitExample(url) {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    // Set implicit wait
    await driver.manage().setTimeouts({ implicit: 5000 });
    
    // Navigate
    await driver.get(url);
    
    // Explicit wait for element
    await driver.wait(until.elementLocated(By.css('h1')), 10000);
    
    // Wait for element to be visible
    const mainContent = await driver.wait(
      until.elementIsVisible(driver.findElement(By.css('body'))),
      10000
    );
    
    // Extract data with explicit waits
    const pageData = await driver.executeScript(() => {
      return {
        title: document.title,
        url: window.location.href,
        h1Text: document.querySelector('h1')?.textContent || null,
        links: Array.from(document.querySelectorAll('a[href^="http"]'))
          .slice(0, 10)
          .map(a => ({
            text: a.textContent.trim(),
            href: a.href
          })),
        meta: {
          description: document.querySelector('meta[name="description"]')?.content,
          keywords: document.querySelector('meta[name="keywords"]')?.content
        }
      };
    });
    
    return pageData;
    
  } finally {
    await driver.quit();
  }
}

// Cross-browser testing
async function crossBrowserTest(url) {
  const browsers = [
    {
      name: 'Chrome',
      builder: new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().addArguments('--headless'))
    },
    {
      name: 'Firefox',
      builder: new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(new firefox.Options().addArguments('--headless'))
    }
  ];
  
  const results = {};
  
  for (const { name, builder } of browsers) {
    const driver = await builder.build();
    
    try {
      const startTime = Date.now();
      await driver.get(url);
      const title = await driver.getTitle();
      const loadTime = Date.now() - startTime;
      
      results[name] = {
        success: true,
        title,
        loadTime,
        currentUrl: await driver.getCurrentUrl()
      };
    } catch (error) {
      results[name] = {
        success: false,
        error: error.message
      };
    } finally {
      await driver.quit();
    }
  }
  
  return results;
}

// Action chains (complex interactions)
async function actionChainsExample(url) {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  const { Actions } = require('selenium-webdriver');
  
  try {
    await driver.get(url);
    
    // Example: Hover over element and click
    const body = await driver.findElement(By.css('body'));
    
    await driver.actions()
      .move({ origin: body })
      .pause(500)
      .click()
      .perform();
    
    // Keyboard actions
    await driver.actions()
      .sendKeys(Key.TAB)
      .pause(100)
      .sendKeys(Key.ENTER)
      .perform();
    
    return { success: true };
    
  } finally {
    await driver.quit();
  }
}

// Frame handling
async function frameHandlingExample(url) {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    await driver.get(url);
    
    // Switch to frame by index
    const frames = await driver.findElements(By.css('iframe'));
    console.log(`Found ${frames.length} frames`);
    
    if (frames.length > 0) {
      // Switch to first frame
      await driver.switchTo().frame(0);
      
      // Get content from frame
      const frameBody = await driver.findElement(By.css('body'));
      const frameText = await frameBody.getText();
      
      // Switch back to main content
      await driver.switchTo().defaultContent();
      
      return {
        frameCount: frames.length,
        frameText: frameText.substring(0, 200)
      };
    }
    
    return { frameCount: 0 };
    
  } finally {
    await driver.quit();
  }
}

// Cookie and local storage management
async function storageManagementExample(url) {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    await driver.get(url);
    
    // Add cookies
    await driver.manage().addCookie({ name: 'test_cookie', value: 'test_value' });
    await driver.manage().addCookie({ name: 'user_pref', value: 'dark_mode' });
    
    // Get all cookies
    const cookies = await driver.manage().getCookies();
    
    // Set local storage
    await driver.executeScript((data) => {
      localStorage.setItem('app_data', JSON.stringify(data));
    }, { userId: 123, theme: 'dark' });
    
    // Get local storage
    const localStorage = await driver.executeScript(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    return {
      cookies: cookies.length,
      localStorage
    };
    
  } finally {
    await driver.quit();
  }
}

// Mobile emulation
async function mobileEmulationExample(url) {
  const mobileEmulation = {
    deviceMetrics: { width: 375, height: 812, pixelRatio: 3 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  };
  
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox');
  options.setMobileEmulation(mobileEmulation);
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    await driver.get(url);
    
    // Verify mobile viewport
    const viewport = await driver.executeScript(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        userAgent: navigator.userAgent
      };
    });
    
    return {
      title: await driver.getTitle(),
      viewport,
      mobileOptimized: viewport.width <= 400
    };
    
  } finally {
    await driver.quit();
  }
}

// AI Agent Pattern: Page monitoring
async function monitorPageChanges(url, selector, timeout = 30000) {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    await driver.get(url);
    
    // Get initial state
    const initialElement = await driver.findElement(By.css(selector));
    const initialText = await initialElement.getText();
    
    // Wait for change
    const changed = await driver.wait(async () => {
      const currentElement = await driver.findElement(By.css(selector));
      const currentText = await currentElement.getText();
      return currentText !== initialText;
    }, timeout);
    
    return {
      changed,
      initialText,
      currentText: changed ? await driver.findElement(By.css(selector)).getText() : initialText
    };
    
  } finally {
    await driver.quit();
  }
}

// Export functions
module.exports = {
  basicExample,
  smartWaitExample,
  crossBrowserTest,
  actionChainsExample,
  frameHandlingExample,
  storageManagementExample,
  mobileEmulationExample,
  monitorPageChanges
};

// Run examples if executed directly
if (require.main === module) {
  (async () => {
    console.log('=== Selenium Examples ===\n');
    
    console.log('1. Basic Example:');
    await basicExample();
    
    console.log('\n2. Smart Wait Example:');
    const data = await smartWaitExample('https://example.com');
    console.log('Page data:', JSON.stringify(data, null, 2));
    
  })().catch(console.error);
}
