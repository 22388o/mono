const puppeteer = require('puppeteer');
const path = require('path');

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}

const main = async () => {
  try{
    const unisatExtPath = path.join(process.cwd(), 'src/test/crx/alby');

    const browser = await puppeteer.launch({
      //headless: 'new',
      headless: false,
      args: [
        `--disable-extensions-except=${unisatExtPath}`,
        `--load-extension=${unisatExtPath}`
      ]
    });
    const projPage = (await browser.pages())[0];
    await projPage.goto('http://localhost:5173', { timeout: 100000 }); // Open the Proj

    projPage.on('dialog', async dialog => { // Handle Accept on Wallet Select Prompt
      await dialog.accept('1');
    })

    await wait(3000);

    const newAlbyPage = (await browser.pages())[1];
    const inputs = (await newAlbyPage.$$('input'));
    await inputs[0].type('TESTPW123_five');
    await inputs[1].type('TESTPW123_five');

    await (await newAlbyPage.$('.bg-primary-gradient')).click();
    await wait(500);
    await (await newAlbyPage.$('.bg-primary-gradient')).click();
    await wait(10000);

    while(1) {
      const len = (await browser.pages()).length;
      if(len > 2) break;
      await wait(3000);
    }

    //Open Temp Mail Page
    const emailPage = await browser.newPage();
    await emailPage.goto('https://internxt.com/temporary-email');
    await wait(5000);
    const email = await emailPage.$eval('.px-4.py-3 p', el => el.innerHTML);

    await wait(1000);
    
    const newAlbyDlg = (await browser.pages())[2];
    await (await newAlbyDlg.$$('.bg-primary-gradient'))[1].click();
    await wait(2000);
    await (await newAlbyDlg.$('.w-full.rounded-md.px-3.py-2.border-1.border-border-secondary')).type(email);
    await (await newAlbyDlg.$('.px-7.py-2.rounded-md')).click();
    
    /** Click Refresh Button to reload the incoming emails */
    await wait(10000);
    await (await emailPage.$('.cursor-pointer.text-gray-50')).click();

    await emailPage.waitForSelector('button.px-4.text-start', { visible: true, timeout: 100000 });
    await (await emailPage.$('button.px-4.text-start')).click();
    await wait(2000);
    let code = await emailPage.$eval('.monospace.otp', el => el.innerHTML);
    code = code.substring(0, 3) + code.substring(code.length - 3);
    console.log(code);

    /** Type One-time Code into the SignUp Page */
    await (await newAlbyDlg.$('.px-3.py-2.border-1.border-border-secondary')).type(code);
    await (await newAlbyDlg.$('.px-7.py-2.rounded-md')).click();
    /** Alby Wallet Extension Created */

    await wait(3000);

    await emailPage.close();
    await newAlbyPage.close();

    /** Alby Wallet Connect */
    await (await projPage.$('.connect-bitcoin')).click();
    await (await projPage.$('#connect-lightning')).click();

    /** Click Approve Button */
    await wait(1000);
    const albyConnectDlg = await (await browser.pages())[1];
    await (await albyConnectDlg.$('button.px-0.py-2.bg-primary-gradient')).click();
    
    /** Simulate Payment */
    await wait(1000);
    await (await projPage.$('#simulate-lightning')).click();
    await wait(1000);
    const albySimulateDlg = await (await browser.pages())[1];
    await (await albySimulateDlg.$('button.px-0.py-2.bg-primary-gradient')).click();
    await wait(1000);
    await (await albySimulateDlg.$('button.px-0.py-2.bg-primary-gradient')).click();
    
    await wait(2000);

    await browser.close();
  } catch (e) {
    console.error(e);
  }
};

//module.exports = async () => {
  main();
//}