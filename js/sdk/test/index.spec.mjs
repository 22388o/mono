/**
* @file Behavioral specification for the Portal SDK as an ES6 module
*/

import runSdkTests from './sdk.spec.cjs'
import Sdk from '../index.mjs'
import Server from 'portal'

runSdkTests(Sdk, Server)
