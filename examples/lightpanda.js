/**
 * Lightpanda Example
 * 
 * Lightpanda is a Zig-based headless browser optimized for speed and low memory usage.
 * Perfect for AI agent workflows and high-concurrency scraping.
 * 
 * Installation:
 *   curl -L https://github.com/lightpanda-io/browser/releases/latest/download/lightpanda-linux-amd64 -o lightpanda
 *   chmod +x lightpanda
 * 
 * Note: Lightpanda uses a different API than traditional browsers.
 * This example shows the concept; actual API may vary as the project evolves.
 */

const { spawn } = require('child_process');
const http = require('http');

class LightpandaClient {
  constructor(port = 9222) {
    this.port = port;
    this.process = null;
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.process = spawn('./lightpanda', ['--port', this.port.toString()], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.process.stdout.on('data', (data) => {
        console.log(`Lightpanda: ${data}`);
        if (data.toString().includes('Server started')) {
          resolve();
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error(`Lightpanda Error: ${data}`);
      });

      this.process.on('error', reject);

      // Fallback timeout
      setTimeout(resolve, 1000);
    });
  }

  async navigate(url) {
    // Lightpanda uses a simplified HTTP API
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: this.port,
        path: `/navigate?url=${encodeURIComponent(url)}`,
        method: 'POST'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });

      req.on('error', reject);
      req.end();
    });
  }

  async query(selector) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: this.port,
        path: `/query?selector=${encodeURIComponent(selector)}`,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });

      req.on('error', reject);
      req.end();
    });
  }

  async getText() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: this.port,
        path: '/text',
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.end();
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
    }
  }
}

// Example usage
async function example() {
  const browser = new LightpandaClient();
  
  try {
    console.log('Starting Lightpanda...');
    await browser.start();
    
    console.log('Navigating to example.com...');
    await browser.navigate('https://example.com');
    
    console.log('Querying h1 element...');
    const h1 = await browser.query('h1');
    console.log('H1 content:', h1);
    
    console.log('Getting page text...');
    const text = await browser.getText();
    console.log('Page text (first 200 chars):', text.substring(0, 200));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    browser.stop();
    console.log('Browser stopped');
  }
}

// AI Agent Pattern: Extract structured data
async function extractDataAI(url, selectors) {
  const browser = new LightpandaClient();
  
  try {
    await browser.start();
    await browser.navigate(url);
    
    const results = {};
    for (const [key, selector] of Object.entries(selectors)) {
      results[key] = await browser.query(selector);
    }
    
    return results;
  } finally {
    browser.stop();
  }
}

// Run example if executed directly
if (require.main === module) {
  example();
}

module.exports = { LightpandaClient, extractDataAI };
