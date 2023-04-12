#!/usr/bin/env node
/**
 * @file Compiles Solidity smart contracts
 */

const { readdirSync, readFileSync, writeFileSync } = require('fs')
const { basename, extname, resolve, join } = require('path')
const solc = require('solc')

const PATH_ROOT = resolve(__dirname, '..')
const PATH_INPUT = join(PATH_ROOT, 'contracts')
const PATH_OUTPUT = join(PATH_ROOT, 'index.json')

const input = {
  language: 'Solidity',
  sources: readdirSync(PATH_INPUT)
    .filter(file => extname(file) === '.sol')
    .map(file => join(PATH_INPUT, file))
    .reduce((sources, file) => {
      sources[basename(file)] = { content: readFileSync(file, 'utf-8') }
      return sources
    }, {}),
  settings: { outputSelection: { '*': { '*': [ '*' ] } } }
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))
const message = output.errors
  .filter(err => err.severity === 'error')
  .map(err => err.formattedMessage)
  .join('\n')

if (message.length) {
  console.log(message)
} else {
  writeFileSync(PATH_OUTPUT, JSON.stringify(output, null, 2))
}
