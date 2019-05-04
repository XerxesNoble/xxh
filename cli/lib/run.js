const validate = require('./validate')
const log = require('./log')
const startSession = require('../commands/start')
const newAlias = require('../commands/new')
const renameAlias = require('../commands/rename')
const deleteAlias = require('../commands/delete')

module.exports = async function run(flags) {
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

  if (!n && !s && !r && !d) exitCode = startSession(_)
  if (n) exitCode = await newAlias(_, s)
  if (r) exitCode = await renameAlias(_)
  if (d) exitCode = await deleteAlias(_)

  return exitCode
}
