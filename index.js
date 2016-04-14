'use strict'

const fs = require('fs')
const read = require('read')
const chalk = require('chalk')


const argv = process.argv
const __rc = `${__dirname}/.xxhrc`
const xxh = {}

function main(){
  let mode = argv[2]
  switch(mode){
    case 'add':
      xxh.add(argv[argv.length-2], argv[argv.length-1], argv.indexOf('-p') > -1)
    break
    case 'delete':
      xxh.delete(argv[argv.length-1])
    break
    case 'list':
      xxh.list()
    break
  }
}


xxh.add = (name, address, _private) => {
  let config = xxh.get(name)
  if(config) {
    return xxh.log('warn', `${chalk.bold(name)} already exists.`)
  } else {
    config = {
      address,
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

xxh.delete = (name) => {
  let rc = xxh.rc()
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
      console.log(`\t${chalk.bold('Address:   ')} ${rc[item].address}`)
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
  return JSON.parse(rc)
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