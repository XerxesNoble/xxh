#!/usr/bin/env python3

import os
import sys
import random
import string
import configparser
from subprocess import call
from configparser import ConfigParser

argv = sys.argv
HOME = os.environ['HOME']
__rc = '{0}/.xxhrc'.format(HOME)

def main():
    # If not rc file, create it
    if not os.path.isfile(__rc): open(__rc, 'w+')
    # If no mode, show help
    if len(argv) > 1: return Xxh(argv[1], __rc)
    else: print_usage()

def print_usage():
    print('usage: \n\txxh [add [-p] name user@host | edit [name] | list [-v] | delete [name | --all] | name]')

def print_man():
    call('man xxh', shell=True)

def filter_opts(args, accepted):
    filtered = []
    for arg in args:
        is_option = arg.find('-') == 0
        if is_option:
            if arg not in accepted:
                print('Unrecognized option "{0}"'.format(arg))
        else:
            filtered.append(arg)
    return filtered

class Xxh(object):

    def __init__(self, mode, rc):
        # Read config file
        self.rc = rc
        self.config = ConfigParser()
        self.config.read(self.rc)
        count = len(argv)
        # Run Actions
        if mode == 'add':
            private = '-p' in argv
            new_argv = filter_opts(argv, ['-p'])
            count = len(new_argv)
            if count >= 4 and count <= 5:
                name_idx = new_argv.index(mode) + 1
                self.add(new_argv[name_idx], new_argv[name_idx + 1], private)
            else:
                self.log('error', 'Expecting name & connection\n'.format(count))
                print_usage()
        elif mode == 'list':
            verbose = '-v' in argv
            self.list(verbose)
        elif mode == 'delete':
            delete_all = '--all' in argv
            new_argv = filter_opts(argv, ['--all'])
            count = len(new_argv)
            name_idx = new_argv.index(mode) + 1
            try:
                name = new_argv[name_idx]
            except IndexError:
                name = 'delete' if not delete_all else ''
            self.delete(name, delete_all)
        elif mode == 'edit':
            self.edit(argv[count-1])
        elif mode == 'help':
            print_man()
        else:
             self.connect(argv[len(argv)-1])


    # xxh add [-p] [name] [connection]
    def add(self, name, connection, private):
        if self.config.has_section(name):
            self.log('warn', '{0} already exists.'.format(name))
        else:
            # Create section add connection
            self.config.add_section(name)
            self.config.set(name, 'connection', connection)
            self.config.set(name, 'private', 'Yes' if private else 'No')

            # Setup private if -p was passed
            if private:
                # Double check with user
                if self.query('Set up rsa keys for {0}?'.format(name)):
                    self.setup_rsa(connection)
                else:
                    self.config.set(name, 'private', 'No')

            # Write to config
            self.save_config('{0} was added!'.format(name))



    def save_config(self, message):
        with open(self.rc, 'w') as c:
            self.config.write(c)
            if message: self.log('info', message)



    # xxh list [-v]
    def list(self, verbose):
        print('')
        for section in self.config.sections():
            if not verbose:
                print('\t➔ {0} \n'.format(section))
            else:
                conn = self.config.get(section, 'connection')
                priv = self.config.get(section, 'private')
                print('\tName: {0} \n\tConnection: {1} \n\tAuthorized: {2}\n'.format(section, conn, priv))



    # xxh delete [connection OR --all]
    def delete(self, name, delete_all):
        if(name.lower() == 'delete'):
            self.log('error', 'Please provide a connection name, or pass --all')
            print('\n\txxh delete [connection name]\t-or-\txxh delete --all\n')
            return
        elif delete_all:
            if self.query('\nAre you sure you want to delete all connections?'):
                for section in self.config.sections():
                    self.remove_rsa(section)
                    self.config.remove_section(section)
                    self.log('info', 'Deleted {0}'.format(section))
                self.save_config('\nAll connections deleted.'.format(name))
        else:
            if self.config.has_section(name):
                if self.query('\nAre you sure?'):
                    self.remove_rsa(name)
                    self.config.remove_section(name)
                    self.save_config('Deleted {0}'.format(name))
            else:
                self.log('error', '{0} doesn\'t exist'.format(name))


    def remove_rsa(self, name):
        conn = self.config.get(name, 'connection')
        if conn and self.query('\nRemove key from remote\'s authorized_keys?'):
            local_file = '{0}/.ssh/id_rsa.pub'.format(HOME)
            with open(local_file, 'r') as id_rsa:
                # Remove new line char
                data = id_rsa.read().replace('\n', '')
                remove_key = '[ -e {1} ] && sed -i -e \'s#{0}##g\' {1}'.format(data, '~/.ssh/authorized_keys')
                call('ssh {0} "{1}"'.format(conn, remove_key), shell=True)


    def edit(self, name):
        if name.lower() == 'edit':
            self.log('error', 'Please provide a connection name')
            print('\n\txxh edit [connection name]\n')
            return
        elif self.config.has_section(name):
            conn = self.config.get(name, 'connection')
            priv = self.config.get(name, 'private')
            # Get name
            new_name = input('Name ({0}): '.format(name))
            if new_name:
                self.config.remove_section(name)
                self.config.add_section(new_name)
                self.config.set(new_name, 'connection', conn)
                self.config.set(new_name, 'private', priv)
                name = new_name
            # Get connection
            new_connection = input('Connection ({0}): '.format(conn))
            if new_connection:
                self.config.set(name, 'connection', new_connection)
            # Save config
            self.save_config('Edited {0}'.format(name))
        else:
            self.log('error', '{0} doesn\'t exist'.format(name))



    def connect(self, name):
        if self.config.has_section(name):
            conn = self.config.get(name, 'connection')
            print('Connecting to {0}'.format(conn))
            call('ssh {0}'.format(conn), shell=True)
        else:
            self.log('error', '{0} doesn\'t exist'.format(name))


    def log(self, type, message):
        # TODO: Add CLI colours so its all pretty and stuff.
        if type is 'info':
            # 'black', 'on_cyan',
            print('\n{0} :: {1}'.format('[ INFO ]', message))
        elif type is 'warn':
            # 'black', 'on_yellow',
            print('\n{0} :: {1}'.format('[ WARN ]', message))
        elif type is 'error':
            # 'white', 'on_red',
            print('\n{0} :: {1}'.format('[ ERROR ]', message))



    def query(self, question):
        valid = {'yes': True, 'y': True, 'ye': True,
                 'no': False, 'n': False}

        while True:
            print('{0} [Y/n] '.format(question))
            choice = input().lower()
            if choice == '':
                return True
            elif choice in valid:
                return valid[choice]
            else:
                print('Invalid input: {0}\n'.format(choice))



    def setup_rsa(self, connection):
        # Create id_rsa if none exists
        if not os.path.isfile('{0}/.ssh/id_rsa'.format(HOME)):
        	call('ssh-keygen -N "" -f ~/.ssh/id_rsa > /dev/null', shell=True)
        # Read id_rsa.pub
        local_file = '{0}/.ssh/id_rsa.pub'.format(HOME)
        # Create commands for setup
        ssh_dir = '~/.ssh'
        auth_keys = '{0}/authorized_keys'.format(ssh_dir)
        # Shell: If there is no ~/.ssh directory, create it and chmod 700
        create_ssh_directory = '[ ! -e {0} ] && mkdir -p {0} && chmod 700 {0}'.format(ssh_dir)
        # Shell: If there is no ~/.ssh/authorized_keys file, create it and chmod 600
        create_auth_keys = '[ ! -e {0} ] && touch {0} && chmod 600 {0}'.format(auth_keys)
        # Read the local id_rsa.pub
        with open(local_file, 'r') as id_rsa:
            # Remove new line char
            data = id_rsa.read().replace('\n', '')
            # Shell: Append the local id_rsa.pub contents into ~/.ssh/authorized_keys
            echo_auth_keys = 'echo "{0}" >> {1}'.format(data, auth_keys)
            # Execute all commands with only one entry into machine.
            cmd = 'ssh {0} "{1}; {2}; {3}"'.format(connection, create_ssh_directory, create_auth_keys, echo_auth_keys)
            call(cmd, shell=True)

try:
    main()
except KeyboardInterrupt:
    pass
