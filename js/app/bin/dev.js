#!/usr/bin/env node
/**
 * @file Runs the app in development mode
 */

const pkg = require('../package.json')
const vite = require('vite')
const Peer = require('@portaldefi/peer')
const chokidar = require('chokidar')
const { join } = require('path')
const config = require('../vite.dev')

/**
 * npm modules that are not tracked by the bundler's watcher
 * @type {Array}
 */
const MODULES = [
  join(__dirname, '..', '..', 'portal'),
  join(__dirname, '..', '..', 'sdk')
]

/**
 * Files ignored in the aforementioned npm modules
 * @type {Array}
 */
const IGNORED = [
  '**/*.md',
  '**/*.nix',
  /.git$/,
  /.nvmrc$/,
  /.parcel-cache$/,
  /dist$/,
  /docs$/,
  /node_modules$/,
  /package-lock.json$/,
  /package.json$/
]

/**
 * Entry point to the web app
 * @type {String}
 */
const APP_ENTRY = join(__dirname, '..', pkg.source)

/**
 * Path to write the build assets
 * @type {String}
 */
const APP_OUTPUT = join(__dirname, '..', 'dist')

/**
 * Tracks the Peer instance used to serve the web-app
 * @type {Peer|null}
 */
let peer = null

/**
 * Starts the peer, and runs a bundler upon peer startup
 * @returns {Void}
 */
function startPeer () {
  new Peer({ root: APP_OUTPUT })
    .on('error', console.error)
    .on('log', console.error)
    .once('start', peerObj => vite
      .build(config)
      .then(watcher => {
        peer = peerObj;
        peerObj.once('stop', () => {
          watcher.unsubscribe()
          startPeer()
        });
        process.on('SIGTERM', () => watcher.close())
        watcher.on('event', event => {
          switch (event.code) {
            case 'START':
            case 'END':
              console.error('info', 'vite.build', event)
              break

            case 'BUNDLE_START':
            case 'BUNDLE_END':
              break

            default:
              console.error('error', 'vite.build', event)
              break
          }
        })
      }))
    .start()
}

/**
 * Sets up a watcher to restart the Peer instance, as needed
 * @returns {Void}
 */
;(async function main () {
  chokidar.watch(MODULES, { ignored: IGNORED, persistent: true })
    .on('ready', () => startPeer())
    .on('change', (path, stats) => peer.stop())
}())
