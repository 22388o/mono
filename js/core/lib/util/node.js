/**
 * @file Helper functions
 */

const crypto = require('crypto')
const uuid = require('uuid')

/**
 * Export the helper functions
 * @type {Object}
 */
const Util = {}

/**
 * Returns random data of the specified length (in bytes)
 * @param {Number} [length=32] The number of bytes of random data to generate
 * @returns {*}
 */
Util.random = function (length = 32) {
  return crypto.randomBytes(length)
}

/**
 * Returns hex-formatted sha256 hash of the provided input
 * @param {String} data The data whose hash is to be calculated
 * @returns {String}
 */
Util.hash = function (data) {
  return new Promise((resolve, reject) => {
    try {
      resolve(crypto.createHash('sha256').update(data).digest('hex'))
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Returns a universally-unique identifier, without any hyphens
 * @returns {String}
 */
Util.uuid = function () {
  return uuid.v4().replace(/-/g, '')
}

/**
 * Export the module
 */
module.exports = { Util }
