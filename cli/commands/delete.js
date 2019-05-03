const messages = require('../messages')
const log = require('../log')
const question = require('../question')
const config = require('../config')

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
