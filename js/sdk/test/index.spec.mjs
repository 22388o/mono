/**
 * @file Behavioral specification for the ES6 module
 */

import SdkDefault, { Sdk } from '../index.mjs'
import { expect } from 'chai'

describe('ES6 module', function () {
  it('exports `Sdk` as default export', () => {
    expect(() => new SdkDefault()).to.throw('no properties specified for the SDK instance!')
  })

  it('exports `Sdk` as a named export', () => {
    expect(() => new Sdk()).to.throw('no properties specified for the SDK instance!')
  })
})
