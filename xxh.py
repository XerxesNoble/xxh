#!/usr/bin/env python3

import os
import sys
import random
import string
import configparser
from subprocess import call
from configparser import SafeConfigParser
# from termcolor import colored, cprint

argv = sys.argv
__rc = '{0}/.xxhrc'.format(os.path.abspath(''))
print('DEBUG-Arguments: {0}'.format(argv))

def main():
    return Xxh(argv[1], __rc)
    
class Xxh(object):
    
    def __init__(self, mode, rc):
        # Read config file
        self.rc = rc
        self.config = SafeConfigParser()
        self.config.read(self.rc)
        
        # Run Actions
        if   mode == 'add'     : self.add(argv[len(argv)-2], argv[len(argv)-1], '-p' in argv)
        elif mode == 'list'    : self.list('-v' in argv)
        elif mode == 'delete'  : self.delete(argv[len(argv)-1], '--all' in argv)
        elif mode == 'edit'    : self.edit(argv[len(argv)-1])
        elif mode == 'connect' : self.connect()
        elif mode == 'select'  : self.connect() # select from a cli list ising arrows and enter
    
    
    
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
                    print('OKAY!')
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
            print('delete all')
        else:
            if self.config.has_section(name):
                if self.query('\nAre you sure?') and self.config.remove_section(name):
                    self.save_config('Deleted {0} \nNote: this does NOT remove the rsa keys from the remote'.format(name))
            else:
                self.log('error', '{0} doesn\'t exist'.format(name))



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



    def connect(self):
        call('ssh xerxes@jscd-sandbox.cloudapp.net', shell=True)
        print('connect')
        
        
    
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
        # Get home dir by platform
        HOME = os.environ['HOME']
        
        # Create id_rsa if none exists
        if not os.path.isfile('{0}/.ssh/id_rsa'.format(HOME)):
        	call('ssh-keygen -N "" -f ~/.ssh/id_rsa > /dev/null', shell=True)

        # Generate random filename
        random_string = ''.join(random.sample(string.ascii_uppercase + string.digits, 10))
        local_file = '{0}/.ssh/id_rsa.pub'.format(HOME)
        remote_file = '/tmp/id_rsa.pub{0}'.format(random_string)

        # Put rsa key in tmp dir
        print('Enter password for "{0}", to copy id_rsa.pub'.format(connection))
        cmd = 'echo "put {0} {1}" | sftp {2} > /dev/null 2> /dev/null'.format(local_file, remote_file, connection)
        call(cmd, shell=True)

        # Add rsa to authorized_keys
        print('Enter password for "{0}" to append id_rsa.pub to authorized_keys'.format(connection))
        cmd = 'ssh {0} "cat {1} >> ~/.ssh/authorized_keys"'.format(connection, remote_file)
        call(cmd, shell=True)

try:
    main()
except KeyboardInterrupt:
    pass
