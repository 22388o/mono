#!/usr/bin/env node
/**
 * @file Compiles Solidity smart contracts
 */

const { readFileSync, writeFileSync } = require('fs')
const { resolve, join } = require('path')
const solc = require('solc')

const PATH_ROOT = resolve(__dirname, '..')
const PATH_INPUT = join(PATH_ROOT, 'contracts', 'swap.sol')
const PATH_OUTPUT = join(PATH_ROOT, 'index.json')

const input = {
  language: 'Solidity',
  sources: { 'swap.sol': { content: readFileSync(PATH_INPUT, 'utf-8') } },
  settings: { outputSelection: { '*': { '*': [ '*' ] } } }
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))

if (output.errors) {
  for (const err of output.errors) {
    console.log(err.formattedMessage)
  }
} else {
  writeFileSync(PATH_OUTPUT, JSON.stringify(output, null, 2))
}
