const Helpers = require('./lib/index.js');
const fs = require('fs');
const path = require('path');

Helpers.compile()
  .then(contracts => {
    console.log('Contracts compilation succeeded.');

    // ensure dist folder exists
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }

    const outputPath = path.join(__dirname, 'dist', 'abi.json');
    fs.writeFileSync(outputPath, JSON.stringify(contracts, null, 2));
  })
  .catch(err => {
    console.log('Contracts compilation failed.');
    console.log(err);
  });
