import { remote } from 'webdriverio'
import path from 'node:path'
import url from 'node:url'
import fs from 'fs';

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}


//console.log(extPath);
const aaa = "file:///Users/dev/Documents/nkbihfbeogaeaoehlefnkodbefgpgknn-10.33.1-Crx4Chrome.com.crx";
const chromeExtension = (await fs.readFile(aaa, () => {})).toString('base64')


const browser = await remote({
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
              '--user-data-dir=/Users/dev/Library/Application\ Support/Google/Chrome/', 
              '--profile-directory=Profile 1',
              //'--load-extension=/Users/dev/Library/Application\ Support/Google/Chrome/Profile 1/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn/10.33.1_0'
            ],
            extensions: [chromeExtension]
        }
    }
})

await browser.url('http://localhost:5173')

const conEthBtn = await browser.$('.connect-ethereum');
await conEthBtn.click();

await wait(2000);

let connectMetamask = await browser.$('#connect-metamask');
console.log(await connectMetamask.getText());
await connectMetamask.click();

await wait(5000);

let windows = await browser.getWindowHandles();
await browser.switchToWindow(windows[1]);

await wait(5000);
const pwdInput = await browser.$('#password');
await pwdInput.sendKeys('TESTPW123');


await browser.deleteSession()

