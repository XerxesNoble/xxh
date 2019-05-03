const messages = require('../messages')
const log = require('../log')
const question = require('../question')
const config = require('../config')

function saveKeys(alias, address) {
  // This is the magic, baby
  log('TODO: save!', alias, address)
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
