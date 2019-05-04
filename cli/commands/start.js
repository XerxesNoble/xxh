const { spawn, spawnSync } = require('child_process')

const messages = require('../lib/messages')
const log = require('../lib/log')
const config = require('../lib/config')

module.exports = function startSession(_, shell = true) {
  const [alias] = _
  const address = config.get(alias)
  if (alias && address) {
    log(messages.startSession(alias, address), '\n')
    spawnSync('ssh', [address], {
      stdio: ['inherit', 'inherit', 'inherit', 'inherit', 'inherit', 'inherit'],
      shell,
    })
  } else {
    if (alias) log(messages.aliasNotFound(alias))
    else log(messages.unknown())
    return 1
  }
  return 0
}
