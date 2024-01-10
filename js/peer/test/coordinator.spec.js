/**
 * @file Behavioral specification for the coordinator client
 */

const Client = require('../lib/coordinator')

describe('Coordinator', function () {
  describe('instantiation', function () {
    it('must throw when instantiated without required arguments', function () {
      expect(() => new Client()).to.throw()
      expect(() => new Client({ id: 'foo' })).to.throw()
      expect(() => new Client({ hostname: 'foo' })).to.throw()
      expect(() => new Client({ port: 8080 })).to.throw()
    })
  })
})
