/**
 * @file Helper functions
 */

const uuid = require('uuid')

/**
 * Export the helper functions
 * @type {Object}
 */
const Helpers = module.exports

/**
 * Returns random data of the specified length (in bytes)
 * @param {Number} [length=32] The number of bytes of random data to generate
 * @returns {*}
 */
Helpers.random = function (length = 32) {
  return crypto.getRandomValues(new Uint8Array(length))
}

/**
 * Returns hex-formatted sha256 hash of the provided input
 * @param {String} data The data whose hash is to be calculated
 * @returns {String}
 */
Helpers.hash = async function (bytes) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map(bytes => bytes.toString(16).padStart(2, '0'))
    .join('')
  return hashHex
}

/**
 * Returns a universally-unique identifier, without any hyphens
 * @returns {String}
 */
Helpers.uuid = function () {
  return uuid.v4().replace(/-/g, '')
}
