const puppeteer = require('puppeteer');

async function runTests() {
    const alice = await setupBrowser();
    const bob = await setupBrowser();

    await performLogin(alice, 1);
    await performLogin(bob, 2);

    await createOrder(alice);
    await createOrder(bob);

    await finalize();
    
    await alice.close();
    await bob.close();
}

async function setupBrowser() {
    const browser = await puppeteer.launch({ headless: "new", args: ['--window-size=1920,1096'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    return browser;
}

async function performLogin(browser, index) {
    const page = await browser.pages()[0]; 
    await page.click('#connect-wallet');
    await page.waitForSelector('.MuiList-root');
    const lis = await page.$$('.MuiList-root li');
    await lis[index].click();
}

async function createOrder(browser) {
    const page = await browser.pages()[0];

    if (browser === bob) {
        await page.click('.exchange');
    }

    const inputs = await page.$$('.qty-input');
    await inputs[0].type('.0001');
    await inputs[1].type('.0001');

    await page.click("button:contains('Swap')");

    await page.waitForSelector('.activitiesContainer');
    const activities = await page.$$('.activitiesContainer .activity-item');
    await activities[0].click();
}

async function finalize() {
    await new Promise(resolve => setTimeout(resolve, 10000));
}

// Execute the tests
runTests().catch(error => {
    console.error('Error during tests:', error);
});
