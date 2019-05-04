#!/usr/bin/env node
const minimist = require('minimist')

const { version } = require('../package.json')
const params = require('./lib/params')
const help = require('./lib/help')
const log = require('./lib/log')
const run = require('./lib/run')

async function main(args) {
  if (args.version) log(version)
  else if (args.help) log(help)
  process.exit(await run(args))
}

main(minimist(process.argv.slice(2), params))
