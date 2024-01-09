/**
 * @file Behavioral specification for the Portal SDK
 */

const { beforeAll, afterAll } = require('../lib/testbed')

/**
 * Sets up the testing environment
 * - Sets up global functions for use within tests
 * - Initializes and starts a peer
 * - Initializes and starts SDK instances for each user
 */
before('spin up the test environment', beforeAll)

/**
 * Tears down the testing environment
 * - Stops the SDK instances for each user
 * - Stops the peer
 * - Restores the global functions that were overridden during setup
 */
after('tear down the test environment', afterAll)
