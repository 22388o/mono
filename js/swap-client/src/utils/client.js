/**
 * @file An HTTP client implementation
 */

'use strict'

import { Buffer } from 'buffer'
import CoreEvents from './CoreEvents'

 /**
  * Exports an implementation of a client
  * @type {Client}
  */
export default class Client extends CoreEvents {
   /**
    * Creates a new instance of Client
    * @param {Object} props Properties of the client
    * @param {String} props.id The unique name of the client
    * @param {String} [props.hostname='localhost'] The hostname of the Portal server
    * @param {Number} [props.port=80] The port of the Portal server
    * @param {String} [props.pathname='/api/v1/updates'] The path to the updates channel
    * @param {Object} [props.credentials] Credentials maintained by the client
    */
  constructor (props) {
    super({
      ...props,
      apiVersion: 2
    });

    this.webln = null
    this.ethereum = null


    Object.seal(this)
  }

  /**
   * Create the required state for an atomic swap
   * @param {body|Object} swap The swap to open
   * @returns {Swap}
   */
  swapOpenV2 (body) {
    return this._request('/api/v2/swap/submarine', { method: 'PUT' },  body )
  }

  /**
   * Completes the atomic swap
   * @param {Body|Object} body The swap to commit
   * @returns {Promise<Void>}
   */
  swapCommitV2 (body) {
    return this._request('/api/v2/swap/submarine', { method: 'POST' },  body )
  }

   /**
    * Handles incoming websocket messages
    * @param {Buffer|Object} msg The message received over the websocket
    * @returns {Void}
    */
  _onMessage (msg) {
    let dat = JSON.parse(msg.data);
    this.emit(dat.status, dat.data);

    /*try {
      arg = JSON.parse(msg.data)
      event = (arg['@type'] != null && arg.status != null)
         ? `${arg['@type'].toLowerCase()}.${arg.status}`
         : 'message'
    } catch (err) {
      event = 'error'
      arg = err
    } finally {
      this.emit('log', 'info', event, arg)
      this.emit(event, arg)
    }*/
  }
 }
