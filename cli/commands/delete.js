const messages = require('../lib/messages')
const log = require('../lib/log')
const question = require('../lib/question')
const config = require('../lib/config')

module.exports = async function deleteAlias([alias]) {
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
