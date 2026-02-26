const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        console.log("Navigating to Simantap...");
        await page.goto('https://simantap.unper.ac.id/login', { waitUntil: 'networkidle2' });
        console.log("Page loaded. Current URL:", page.url());

        const inputs = await page.evaluate(() => {
            const allInputs = Array.from(document.querySelectorAll('input'));
            return allInputs.map(i => ({
                type: i.type,
                name: i.name,
                id: i.id,
                placeholder: i.placeholder
            }));
        });

        console.log("Found inputs:", JSON.stringify(inputs, null, 2));

        await browser.close();
        console.log("Test completed successfully.");
    } catch (error) {
        console.error("Test failed:", error);
    }
})();
