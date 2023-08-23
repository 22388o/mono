/**
 * @file Behavioral specification for the Portal SDK as a CommonJS module
 */

const Sdk = require('../index.cjs')
const Server = require('server')
const runSdkTests = require('./sdk.spec.cjs')

runSdkTests(Sdk, Server)
