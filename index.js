'use strict'

const fs = require('fs')
const read = require('read')
const chalk = require('chalk')

const __rc = `${__dirname}/.xxhrc`

const argv = process.argv
const xxh = {}

function main(){
  let mode = argv[2]
  switch(mode){
    case 'add':
      xxh.add(argv[argv.length-2], argv[argv.length-1], argv.indexOf('-p') > -1)
    break
    case 'delete':
      xxh.delete(argv[argv.length-1], argv.indexOf('--all') > -1)
    break
    case 'list':
      xxh.list()
    break
    case 'edit':
      xxh.log('info', 'edit command comming soon!')
    break
    default:
      xxh.run(argv[argv.length-1])
    break
  }
}

xxh.connect = (config) => {
  console.log(config)
}

xxh.run = (name) => {
  let config = xxh.get(name)
  if(config) {
    xxh.log('info', `connecting to: ${chalk.bold(name)}`)
    // Connexct via SSH
    xxh.connect(config)
  } else {
    return xxh.log('error', `${chalk.bold(name)} is not a command or a matching address.`)
  }
}

xxh.add = (name, address, _private) => {
  let config = xxh.get(name)
  if(config) {
    return xxh.log('warn', `${chalk.bold(name)} already exists.`)
  } else {
    let a = address.split(':')
    let b = a[0].split('@')
    console.log(b)
    config = {
      user: b[0],
      address: b[1],
      port: a[1] || 22,
      private: _private,
      key: null
    }
  }
  
  if(_private){
    read({
      prompt: 'password: ',
      silent: true,
      replace: '•'
    }, (error, result) => {
      if(error) {
        return xxh.log('error', error)
      } else {
        // TODO: Encrypt key
        config.key = result
        xxh.appendToRc(name, config)
      }
    })
  } else {
    xxh.appendToRc(name, config)
  }
}

xxh.delete = (name, all) => {
  let rc = xxh.rc()
  if(!rc) return
  
  if(all) {
    return Object.keys(rc).forEach(xxh.delete)
  }
  
  if(rc[name]) {
    delete rc[name]
    rc = JSON.stringify(rc)
    fs.writeFileSync(__rc, rc, 'utf8')
    xxh.log('info', `${name} was removed!`)
  }
}

xxh.list = () => {
  let rc = xxh.rc()
  for (var item in rc) {
    if (rc.hasOwnProperty(item)) {
      console.log(`\n`)
      console.log(`\t${chalk.bold('Name:      ')} ${item}`)
      console.log(`\t${chalk.bold('User:      ')} ${rc[item].user}`)
      console.log(`\t${chalk.bold('Address:   ')} ${rc[item].address}`)
      console.log(`\t${chalk.bold('Port:      ')} ${rc[item].port}`)
      console.log(`\t${chalk.bold('Private:   ')} ${rc[item].private}`)
    }
  }
}

xxh.get = (name) => {
  let rc = xxh.rc()
  return rc[name]
}

xxh.appendToRc = (name, config) => {
  let rc = xxh.rc()
  rc[name] = config
  rc = JSON.stringify(rc)
  fs.writeFileSync(__rc, rc, 'utf8')
  xxh.log('info', `${name} was added!`)
}

xxh.rc = () => {
  let rc = fs.readFileSync(__rc, 'utf8')
  return rc ? JSON.parse(rc) : {}
}

xxh.log = (type, message) => {
  switch(type){
    case 'info':
      console.log(`${chalk.bgCyan.black('[ INFO ]')} :: ${message}`)
    break;
    case 'warn':
      console.log(`${chalk.bgYellow.black('[ WARN ]')} :: ${message}`)
    break;
    case 'error':
      console.log(`${chalk.bgRed.white('[ ERR ]')} :: ${message}`)
    break;
  }
}

main()