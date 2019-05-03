#!/usr/bin/env node
const minimist = require('minimist')

const { version } = require('../package.json')
const help = require('./help')
const validate = require('./validate')
const startSession = require('./commands/start')
const newAlias = require('./commands/new')
const renameAlias = require('./commands/rename')
const deleteAlias = require('./commands/delete')

const { log } = console

const args = minimist(process.argv.slice(2), {
  boolean: ['save', 'new', 'delete', 'rename', 'help', 'version'],
  alias: {
    save: 's',
    new: 'n',
    delete: 'd',
    rename: 'r',
    help: 'h',
    version: 'v',
  },
})

async function run(flags) {
  const {
    _, n, s, r, d,
  } = flags
  let exitCode = 0

  // No arguments passed in.
  if (_.length === 0 && [n, s, r, d].every(a => a === false)) {
    log('TODO: Launch UI view to select connection')
    return exitCode
  }

  // Validate all flags
  const validation = validate(flags)
  if (validation !== true) {
    log(validation)
    exitCode = 1
  }

  // Attempt to start an SSH session
  if (!n && !s && !r && !d) exitCode = startSession(_)
  // Attempt to create an SSH alias
  if (n) exitCode = await newAlias(_, s)
  // Attempt to rename an ssh alias
  if (r) exitCode = await renameAlias(_)
  // Attempt to delete an ssh alias
  if (d) exitCode = await deleteAlias(_)

  return exitCode
}

if (args.version) log(version)
else if (args.help) log(help)
else run(args)

log('END!')
