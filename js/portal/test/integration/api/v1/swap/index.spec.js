/**
 * @file Test suite setup for testing atomic swaps
 */

const Swaps = require('../../../../../lib/core/swaps')
const Context = require('../../../../../lib/core/context')

/**
 * Spins up the testing environment
 */
before('Create atomic swap for testing', function () {
  this.swaps = new Swaps(null, Context)
})

/**
 * Spins down the testing environment
 */
after('Clean up atomic swap after testing', function () {
  this.test.ctx.swaps = null
})
