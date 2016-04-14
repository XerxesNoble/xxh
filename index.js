'use strict'

const fs = require('fs')

const argv = process.argv
const __rc = `${__dirname}/.xxhrc`
const xxh = {}

function main(){
  let mode = argv[2]
  switch(mode){
    case 'add':
      xxh.add(argv[argv.length-2], argv[argv.length-1], argv.indexOf('-p') > -1)
    break
  }
}

xxh.add = (name, address, _private) => {
  let config = xxh.get(name)
  if(config) {
    return xxh.log('warn', `${name} already exists.`)
  }
  
  let config = {
    address,
    private: _private,
    key: null
  }
  
  if(_private){
    
  } else {
    xxh.appendToRc(name, config)
  }
  
}

xxh.get = (name) => {
  let rc = xxh.rc()
  return rc[name]
}

xxh.appendToRc = (name, config) => {
  let rc = xxh.rc()
  rc[name] = config
  
  fs.readFileSync(__rc, rc, 'utf8')
  xxh.log('info', `${name} was added!`)
}

xxh.rc = () => {
  let rc = fs.readFileSync(__rc, 'utf8')
  return JSON.parse(rc)
}

xxh.log = (type, message) => {
  switch(type){
    case 'info':
      console.log(`[ INFO ] :: ${message}`)
    break;
    case 'warn':
      console.log(`[ WARN ] :: ${message}`)
    break;
    case 'error':
      console.log(`[ ERR ] :: ${message}`)
    break;
  }
}

main();