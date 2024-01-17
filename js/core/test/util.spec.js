/**
 * @file Behavioral specification for utility functions
 */

const { expect } = require('chai')
const { Util } = require('..')

describe('Utility Functions', function () {
  describe('hash()', function () {
    it('must generate a 256-bit sha3 hash', async function () {
      const arg = 'foobarbaz'
      const actual = await Util.hash(arg)
      const expected = '97df3588b5a3f24babc3851b372f0ba71a9dcdded43b14b9d06961bfc1707d9d'
      expect(actual).to.equal(expected)
    })
  })

  describe('uuid()', function () {
    it('must generate a 32-character uuid', function () {
      const uuid = Util.uuid()
      expect(uuid).to.be.a('string')
      expect(uuid.length).to.equal(32)
      expect(uuid).to.match(/[a-z0-9]{32}/)
    })
  })
})
