const { validation } = require('./messages')

module.exports = ({
  n, s, r, d,
}) => {
  if (n && r) return validation('--new, -n', '--rename, -r', 'cannot')
  if (n && d) return validation('--new, -n', '--delete, -d', 'cannot')
  if (!n && s) return validation('--save, -s', '--new, -n', 'must')
  if (r && d) return validation('--rename, -r', '--delete, -d', 'cannot')
  return true
}
