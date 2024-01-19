/**
 * @file Behavioral specification for the API
 */

const { Network } = require('@portaldefi/core')
const { Coordinator } = require('../..')

before('spin up the coordinator', async function () {
  this.coordinator = new Coordinator({ id: 'coordinator' })
  await this.coordinator.start()

  this.network = new Network({
    id: 'network',
    uid: 'alice',
    hostname: this.coordinator.hostname,
    port: this.coordinator.port,
    pathname: this.coordinator.pathname
  })
  await this.network.connect()
})

after('tear down the coordinator', async function () {
  await this.test.ctx.network.disconnect()
  await this.test.ctx.coordinator.stop()
})
