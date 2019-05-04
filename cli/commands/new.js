const os = require('os')
const fs = require('fs')
const { spawn } = require('child_process')

const messages = require('../lib/messages')
const log = require('../lib/log')
const question = require('../lib/question')
const config = require('../lib/config')

const HOME = os.homedir()

async function saveKeys(alias, address) {
  if (!fs.existsSync(`${HOME}/.ssh/id_rsa`)) {
    spawn('ssh-keygen', `-N "" -f ${HOME}/.ssh/id_rsa`.split(' '), { stdio: 'inherit' })
    log('\n')
  }

  const idRSA = fs.readFileSync(`${HOME}/.ssh/id_rsa.pub`, 'utf8').replace('\n', '')
  const authKeys = '~/.ssh/authorized_keys'
  const createSSHDir = '[ ! -e ~/.ssh ] && mkdir -p ~/.ssh && chmod 700 ~/.ssh'
  const createAuthKeys = `[ ! -e ${authKeys} ] && touch ${authKeys} && chmod 600 ${authKeys}`
  const echoAuthKeys = `echo "${idRSA}" >> ${authKeys}`

  spawn('ssh', [address, `"${createSSHDir}; ${createAuthKeys}; ${echoAuthKeys}"`], {
    stdio: 'inherit',
    shell: true,
  })
  log('\n')
}

module.exports = async function createAlias(_, s) {
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
