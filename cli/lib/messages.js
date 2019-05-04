const chalk = require('chalk')

module.exports = {
  aliasNotFound: alias => chalk`{bold.red [ERROR]} Alias {italic "${alias}"} was not found
{bold.yellow [FIX]} Create it using: {italic xxh -ns ${alias} username@address}
{bold.cyan [HELP]} {italic xxh --help} for more info`,
  unknown: () => chalk`{bold.red [ERROR]} Unknown command.
{bold.cyan [HELP]} {italic xxh --help} for more info`,
  confirmNew: (alias, address) => chalk`{bold.yellow [CONFIRM]} Create an alias "{bold ${alias}}" with address "{bold ${address}}"? [Y/n]: `,
  validation: (c1, c2, v) => chalk`{bold.red [ERROR]} flags {italic ${c1}} and {italic ${c2}} ${v} be used together.`,
  aliasAlreadyExists: alias => chalk`{bold.red [ERROR]} The alias "${alias}" already exists.
{bold.cyan [HELP]} Choose another alias
{bold.cyan [HELP]} Rename the existing alias with {italic xxh -r ${alias}}
{bold.cyan [HELP]} Delete the existing alias with {italic xxh -d ${alias}}`,
  noAddress: alias => chalk`{bold.red [ERROR]} Please provide an address to alias.
{bold.cyan [HELP]} Usage: {italic xxh -ns ${alias} username@127.0.0.1}`,
  createdAlias: (alias, address) => chalk`{bold.green [SUCCESS]} Created alias ${alias} for address ${address}`,
  goodbye: () => chalk`
💜 {bold.hex('#5EBD3E') G}{bold.hex('#FFB900') o}{bold.hex('#F78200') o}{bold.hex('#E23838') d}{bold.hex('#973999') b}{bold.hex('#4B0082') y}{bold.hex('#009CDF') e}!`,
  confirmRename: (o, n) => chalk`{bold.yellow [CONFIRM]} Are you sure you want to rename alias "${o}" to "${n}"? [Y/n]: `,
  confirmDelete: o => chalk`{bold.yellow [CONFIRM]} Are you sure you want to delete alias "${o}"? [Y/n]: `,
  renamedAlias: (o, n) => chalk`{bold.green [SUCCESS]} Renamed alias "${o}" to "${n}"`,
  deletedAlias: o => chalk`{bold.green [SUCCESS]} Deleted alias "${o}"`,
  startSession: (alias, address) => chalk`{bold.green [SESSION]} Opening ${alias} SSH session at ${address}...`,
}
