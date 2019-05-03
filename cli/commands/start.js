const { spawn } = require('child_process')

const messages = require('../messages')
const log = require('../log')
const config = require('../config')

module.exports = function startSession(_, shell = true) {
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
