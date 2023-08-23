const webdriver = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome.js');
const path = require('path');

const projDir = path.resolve(__dirname, '../..')

const options = new chrome.Options();
options.setLoggingPrefs({
  browser: 'ALL'
});
options.addArguments('--enable-logging');
options.addArguments("--log-level=0");
options.addExtensions(`${projDir}/src/test/crx/unisat.crx`);

const By = webdriver.By; 
const driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}

let windows, seeds = [];


async function main() {
  try {
    await driver.navigate().to("http://localhost:5173");

    await wait(3000);

    windows = await driver.getAllWindowHandles();
    await driver.switchTo().window(windows[1]);

    const createWalletBtn = await driver.findElement(By.css('.layout > div:first-child > div:first-child > div:nth-child(2) > div:nth-child(2)'));
    await createWalletBtn.click();

    const pwdInputs = await driver.findElements(By.tagName('input'));
    await pwdInputs[0].sendKeys('TESTPW123');
    await pwdInputs[1].sendKeys('TESTPW123');

    const continueBtn = await driver.findElement(By.css('.layout > div:first-child > div:first-child > div:first-child > div:nth-child(5)'));
    await continueBtn.click();

    await wait(500);

    const seedContainer = await (await driver.findElement(By.css('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(4) > div:first-child'))).findElements(By.css('.row-container'));
    console.log(seedContainer.length);
    for(let i = 0; i < 12; i ++) {
      const seed = await (await seedContainer[i].findElement(By.css('div:nth-child(2) > div:first-child > span'))).getText();
      seeds.push(seed);
    }

    console.log(seeds);

    await (await driver.findElement(By.css('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(5) > label'))).click();
    await (await driver.findElement(By.css('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(6) > div:nth-child(2) > div:first-child'))).click();

    await wait(200);
    await (await driver.findElement(By.css('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(10) > div:nth-child(2) > div:first-child'))).click();

    await driver.close();

    await wait(2000);

    await driver.switchTo().window((await driver.getAllWindowHandles())[0]);
    
    let res = await driver.findElement(By.className('connect-bitcoin'));
    await res.click();

    let connectL1 = await driver.findElement(By.id('connect-l1'));
    await connectL1.click();

    await wait(500);
    await driver.switchTo().alert().accept();

    await wait(500);
    windows = await driver.getAllWindowHandles();
    await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

    //Unisat control
    /*const pwdInput = await driver.findElement(By.tagName('input'));
    await pwdInput.sendKeys('TESTPW123');

    const firstDiv = await driver.findElement(By.css('.layout > div:first-child > div:first-child > div:nth-child(2) > div:nth-child(3)'));
    await firstDiv.click();*/

    await wait(2000);

    windows = await driver.getAllWindowHandles();
    if(windows.length === 1) {
      console.log('Unisat Wallet Connected!');
    }
    else {
      await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

      const approveBtn = await driver.findElement(By.css('.layout > div:nth-child(3) > div:first-child > div:nth-child(2)'));
      await approveBtn.click();
      console.log('Unisat Wallet Connected!');

      await wait(1000);
    }


    const logs = await driver.manage().logs().get('browser');
    const idxLog = logs.findIndex(log => log.message.indexOf("Unisat Wallet Connected") >= 0);
    if(idxLog >= 0) {
      console.log('Address Detected');
      console.log(logs[idxLog].message);
    }

    await driver.switchTo().window(windows[0]);

    const modal = await driver.findElement(By.className('connect-modal-color'));
    const simulate = await modal.findElement(By.className('simulate-l1'));
    await simulate.click();

    await wait(3000);
    
    windows = await driver.getAllWindowHandles();
    await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window
  } catch(e) {
    console.error(e);
  }
}

main();