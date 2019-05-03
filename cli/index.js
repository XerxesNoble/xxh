#!/usr/bin/env node

const { spawn } = require('child_process')
const readline = require('readline')
const minimist = require('minimist')
const Conf = require('conf')

const { version } = require('../package.json')
const help = require('./help')
const messages = require('./messages')
const validate = require('./validate')

const { log } = console
const config = new Conf()
// const aliases = Object.keys(config.store)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

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

function startSession(_, shell = true) {
  const [alias] = _
  const address = config.get(alias)
  if (alias && address) {
    log(messages.startSession(alias, address))
    spawn('ssh', [address], { stdio: 'inherit', shell })
  } else {
    if (alias) log(messages.aliasNotFound(alias))
    else log(messages.unknown())
    return 1
  }
  return 0
}

function saveKeys(alias, address) {
  // This is the magic, baby
  log('TODO: save!', alias, address)
}

function question(q) {
  return new Promise((resolve) => {
    rl.question(q, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

async function createAlias(_, s) {
  const [alias, address] = _

  // If alias already exists, exit
  if (config.has(alias) || !alias || !address) {
    if (config.has(alias)) log(messages.aliasAlreadyExists(alias))
    if (!alias) log(messages.aliasNotFound(alias))
    if (!address) log(messages.noAddress(alias))
    return 1
  }

  // If alias and address are valid inputs and there is no existing alais
  if (alias && address && !config.has(alias)) {
    // Confim creation of alias
    const answer = await question(messages.confirmNew(alias, address))
    if ((answer || 'y').toLowerCase() === 'y') {
      config.set(alias, address)
      if (s) saveKeys(alias, address)
      else log(messages.createdAlias(alias, address))
    } else {
      log(messages.goodbye())
    }
  }
  return 0
}

async function renameAlias([currentAlias, newAlias]) {
  if (config.has(currentAlias) && !config.has(newAlias)) {
    const address = config.get(currentAlias)
    const answer = await question(messages.confirmRename(currentAlias, newAlias))
    if ((answer || 'y').toLowerCase() === 'y') {
      config.set(newAlias, address)
      config.delete(currentAlias)
      log(messages.renamedAlias(currentAlias, newAlias))
    } else {
      log(messages.goodbye())
    }
  } else {
    if (config.has(newAlias)) log(messages.aliasAlreadyExists(newAlias))
    if (!config.has(currentAlias)) log(messages.aliasNotFound(currentAlias))
    return 1
  }
  return 0
}

async function deleteAlias([alias]) {
  if (!alias || !config.has(alias)) {
    log(messages.aliasNotFound(alias))
    return 1
  }

  const answer = await question(messages.confirmDelete(alias))
  if ((answer || 'y').toLowerCase() === 'y') {
    config.delete(alias)
    log(messages.deletedAlias(alias))
  } else {
    log(messages.goodbye())
  }

  return 0
}

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
  if (n) exitCode = await createAlias(_, s)

  // Attempt to rename an ssh alias
  if (r) exitCode = await renameAlias(_)

  // Attempt to delete an ssh alias
  if (d) exitCode = await deleteAlias(_)

  return exitCode
}

if (args.version) log(version)
else if (args.help) log(help)
else run(args)
