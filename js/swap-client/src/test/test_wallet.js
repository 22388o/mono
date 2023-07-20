import webdriver from "selenium-webdriver";
import chrome from 'selenium-webdriver/chrome.js';

const options = new chrome.Options();
options.setLoggingPrefs({
  browser: 'ALL'
});
options.addArguments('--enable-logging');
options.addArguments("--log-level=0");
options.addArguments("--user-data-dir=/Users/dev/Library/Application\ Support/Google/Chrome");
options.addArguments("--profile-directory=Profile 1");


const driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

async function main() {
  await driver.navigate().to("http://localhost:5173");
  console.log(123);
}

main();