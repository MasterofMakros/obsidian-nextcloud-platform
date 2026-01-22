const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));

    try {
        const response = await page.goto('http://localhost:3000');
        console.log(`Status: ${response.status()}`);
        // Wait a bit for client hydration
        await page.waitForTimeout(2000);
    } catch (err) {
        console.error('Failed to load:', err);
    }

    await browser.close();
})();
