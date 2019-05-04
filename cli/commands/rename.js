const messages = require('../lib/messages')
const log = require('../lib/log')
const question = require('../lib/question')
const config = require('../lib/config')

module.exports = async function renameAlias([currentAlias, newAlias]) {
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
