const puppeteer = require('puppeteer')
const path = require('path')
const { Given, When, Then } = require('@cucumber/cucumber')

const wait = (t) => {
  return new Promise((res, rej) => {
    setTimeout(res, t)
  })
}

let browser, projPage

async function runTests () {
  await openTestBrowser()
  await createUnisatWallet()
  await connectUnisatWallet()
  await simulateUnisatPayment()
}

const openTestBrowser = async () => {
  const unisatExtPath = path.join(process.cwd(), 'test/ui/crx/unisat')

  browser = await puppeteer.launch({
    //headless: 'new',
    headless: false,
    args: [
      `--disable-extensions-except=${unisatExtPath}`,
      `--load-extension=${unisatExtPath}`
    ]
  })
  projPage = (await browser.pages())[0]
  await projPage.goto('http://localhost:5173') // Open the Proj
}

const createUnisatWallet = async () => {
  await wait(5000)

  const newUniSatPage = (await browser.pages())[1]
  await (await newUniSatPage.$('.layout > div:first-child > div:first-child > div:nth-child(2) > div:nth-child(2)')).click() // Click on Create new Wallet

  await wait(500)

  const inputs = await newUniSatPage.$$('input') // Input passwords
  await inputs[0].type('TESTPW123_five')
  await inputs[1].type('TESTPW123_five')
  await (await newUniSatPage.$('.layout > div:first-child > div:first-child > div:first-child > div:nth-child(5)')).click() // Click on Continue

  await wait(500)

  const seedContainer = await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(4) > div:first-child')).$$('.row-container'); const seeds = []
  for (let i = 0; i < 12; i++) {
    const seed = await seedContainer[i].$eval('div:nth-child(2) > div:first-child > span', el => el.innerHTML)
    seeds.push(seed)
  }
  console.log(seeds)

  await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(5) > label')).click() // Saved Radio Check
  await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(6) > div:nth-child(2) > div:first-child')).click() // Click on Continue

  await wait(500)
  await (await newUniSatPage.$('.layout > div:nth-child(2) > div:nth-child(2) > div:nth-child(10) > div:nth-child(2) > div:first-child')).click() // Click on Continue

  await wait(2000)
}

const connectUnisatWallet = async () => {
  // Unisat Wallet Connect

  const [walletConnectBtn] = await projPage.$x("//button[contains(., 'Connect Wallet')]");
  await walletConnectBtn.click();
  await (await projPage.$('#unisat-connect-btn')).click()

  await wait(3000)

  const walletDlg = (await browser.pages())[1]
  await (await walletDlg.$('.layout > div:nth-child(3) > div:first-child > div:nth-child(2)')).click() // Click on Connect
  console.log('Unisat Wallet Connected')

  await wait(2000)
}

const simulateUnisatPayment = async () => {
  await (await projPage.$('.simulate-unisat')).click()

  await wait(3000)

  await browser.close()
}

// Execute the tests
runTests().catch(error => {
  console.error('Error during tests:', error)
})
