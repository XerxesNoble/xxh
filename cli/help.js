const chalk = require('chalk')

module.exports = chalk`
    {bold Usage}
      $ {italic.hex('#CDDC39') xxh <alias>}

    {bold Options}
      {hex('#B3E5FC') --version, -v}      {italic Display the version}
      {hex('#B3E5FC') --help, -h}         {italic Display this help text}
      {hex('#B3E5FC') --new, -n}          {italic Create a new aliased SSH connection}
      {hex('#B3E5FC') --save, -s}         {italic Save SSH Keys to remote machine}
      {hex('#B3E5FC') --rename, -r}       {italic Rename the alias of an existing SSH connection}
      {hex('#B3E5FC') --delete, -d}       {italic Delete the alias and remove any saved SSH Keys}

    {bold Examples}
      {bold.dim Create a new aliased SSH connection:}
        $ {italic.hex('#CDDC39') xxh --new --save my_connection username@127.0.0.1}

      {bold.dim Equivalent to:}
        $ {italic.hex('#CDDC39') xxh -ns my_connection username@127.0.0.1}

      {bold.dim Edit an existing aliased SSH connection:}
        $ {italic.hex('#CDDC39') xxh --rename my_connection my_awesome_connection}

      {bold.dim Start a SSH session:}
        $ {italic.hex('#CDDC39') xxh my_awesome_connection}

      {bold.dim Delete an existing aliased SSH connection:}
        $ {italic.hex('#CDDC39') xxh --delete my_awesome_connection}
`
