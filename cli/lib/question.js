const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

module.exports = async function question(q) {
  return new Promise((resolve) => {
    rl.question(q, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}
