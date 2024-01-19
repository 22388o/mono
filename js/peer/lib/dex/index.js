/**
 * @file An interface to the dex
 */

const { BaseClass } = require('@portaldefi/core')

module.exports = class Dex extends BaseClass {
  constructor (props) {
    super({ id: 'dex' })
  }

  submitLimitOrder (order) {
    throw Error('not implemented!')
  }

  cancelLimitOrder (order) {
    throw Error('not implemented!')
  }
}
