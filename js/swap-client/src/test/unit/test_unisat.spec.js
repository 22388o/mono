const puppeteer = require('puppeteer');
const path = require('path');

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}

describe('Unisat Wallet Test', async () => {
  let browser, projPage;
  before('Open Test Browser', async () => {
    const unisatExtPath = path.join(process.cwd(), 'src/test/crx/unisat');

    browser = await puppeteer.launch({
      headless: 'new',
      //headless: false,
      args: [
        `--disable-extensions-except=${unisatExtPath}`,
        `--load-extension=${unisatExtPath}`
      ]
    });
    projPage = (await browser.pages())[0];
    await projPage.goto('http://localhost:5173'); // Open the Proj

    projPage.on('dialog', async dialog => { // Handle Accept on Wallet Select Prompt
      await dialog.accept('1');
    })
  });

  describe('Create new unisat wallet', async () => {
    let newUniSatPage;

    it('Input passwords', async () => {
      await wait(5000);
      
      newUniSatPage = (await browser.pages())[1];
      await (await newUniSatPage.$('.layout > div:first-child > div:first-child > div:nth-child(2) > div:nth-child(2)')).click(); // Click on Create new Wallet
  
      await wait(500);
  
      const inputs = await newUniSatPage.$$('input'); //Input passwords
      await inputs[0].type('TESTPW123');
      await inputs[1].type('TESTPW123');
      await (await newUniSatPage.$('.layout > div:first-child > div:first-child > div:first-child > div:nth-child(5)')).click(); // Click on Continue
  
      await wait(500);
    });

    it('Log Seed phrases', async () => {
      const seedContainer = await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(4) > div:first-child')).$$('.row-container'), seeds = [];
      for(let i = 0; i < 12; i ++) {
        const seed = await seedContainer[i].$eval('div:nth-child(2) > div:first-child > span', el => el.innerHTML);
        seeds.push(seed);
      }
      console.log(seeds);
    });

    it('Proceed to create', async () => {
      await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(5) > label')).click(); // Saved Radio Check
      await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(6) > div:nth-child(2) > div:first-child')).click(); // Click on Continue

      await wait(500);
      await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(10) > div:nth-child(2) > div:first-child')).click(); // Click on Continue

      await newUniSatPage.close();

      await wait(2000);
    })
  });

  describe('Connect unisat wallet to the project', async () => {
    //Unisat Wallet Connect

    it('must connect', async () => {
      await (await projPage.$('.connect-bitcoin')).click();
      await (await projPage.$('#connect-l1')).click();
      await wait(3000);

      const walletDlg = (await browser.pages())[1];
      await (await walletDlg.$('.layout > div:nth-child(3) > div:first-child > div:nth-child(2)')).click(); // Click on Connect
      await wait(2000);
    })
  });

  describe('Simulate payment on unisat wallet', async () => {
    it('must simulate', async () => {
      await (await (await projPage.$('.connect-modal-color')).$('.simulate-l1')).click();

      await wait(3000);
    });
  });

  after('Close Browser', async () => {
    await browser.close();
  });
});