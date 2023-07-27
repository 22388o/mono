/**
 * @file Behavioral specification for the Portal SDK as a CommonJS module
 */

const runSdkTests = require('./sdk.spec.cjs')
const Sdk = require('../index.cjs')
const Server = require('portal')

runSdkTests(Sdk, Server)
