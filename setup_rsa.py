#!/usr/bin/env python

from subprocess import call
import os
import sys
import random
import string

HOME = os.environ['HOME']

if not os.path.isfile(HOME + '/.ssh/id_rsa'):
	call('ssh-keygen -N "" -f ~/.ssh/id_rsa > /dev/null', shell=True)

# get info
remote_user = raw_input('remote_user: ')
remote_host = raw_input('remote_host: ')


# prepare var
random_string = ''.join(random.sample(string.ascii_uppercase + string.digits, 10))
local_file = HOME + '/.ssh/id_rsa.pub'
remote_file = '/tmp/id_rsa.pub' + random_string


print 'enter password of remote user account to copy id_rsa.pub to remote server'
command = 'echo "put %s %s" | sftp %s@%s > /dev/null 2> /dev/null' % (local_file, remote_file, remote_user, remote_host)
print command
call(command, shell=True)


print 'enter password of remote user account to append id_rsa.pub to authorized_keys'
command = 'ssh %s@%s "cat %s >> ~/.ssh/authorized_keys"' % (remote_user, remote_host, remote_file)
print command
call(command, shell=True)