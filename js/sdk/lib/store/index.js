/**
 * @file Exposes the appropriate store implementation
 */

/* eslint-disable no-new-func */
const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')
// const isNode = new Function('try {return this===global;}catch(e){return false;}')
/* eslint-enable no-new-func */

const { Store } = isBrowser()
? require('./browser')
: require('./node');

module.exports = Store;
