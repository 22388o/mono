/**
* @file Behavioral specification for the Portal SDK as an ES6 module
*/

import Sdk from '../index.mjs'
import Server from 'server'
import runSdkTests from './sdk.spec.cjs'

runSdkTests(Sdk, Server)
