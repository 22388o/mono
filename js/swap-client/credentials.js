const alice = require('../portal/test/unit/alice.js');
const bob = require('../portal/test/unit/bob.js');
const fs = require('fs');

// Convert the credentials object to JSON and save it inside utils
fs.writeFileSync('./src/utils/credentials/alice.json', JSON.stringify(alice, null, 2));
fs.writeFileSync('./src/utils/credentials/bob.json', JSON.stringify(bob, null, 2));
