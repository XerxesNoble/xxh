# xxh

[![NPM](https://nodei.co/npm/xxh.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/xxh/)


An ssh connection manager. Sets up your rsa keys for you because life should be easy for the lazy programmer.

*xxh* manages your ssh connections and provides a helper to set up you rsa keys so you don't have to type in your password every time you connect to your remote. Simply add the [-p] flag to the [add] command and *xxh* will walk you through the set up. You will have to enter your password twice. Once to to copy `id_rsa.pub` to the remote, and again to append `id_rsa.pub` to the remotes authorized_keys file.

### Install
```bash
$ npm install xxh -g
```

### Usage

```bash
$ xxh [add [-p] name user@host | edit [name] | list [-v] | delete [name | --all] | name]
```

### Connect
```bash
# Start SSH session
$ xxh my_conn
```

### Add
Add a connection to the ~/.xxhrc config.

```bash
# Add connection without rsa setup
$ xxh add my_conn user@connection.name.com

# Add connection with rsa setup
$ xxh add -p my_conn user@connection.name.com
```

### List
List all saved connections by name
```bash
# List all connections
$ xxh list

# List all connections with name, host and auth details
$ xxh list -v
```

### Delete
Delete a saved connection by name or all of them.

```bash
# Delete connection
$ xxh delete my_conn

# Delete all connections
$ xxh delete --all
```

### Edit
Edit a saved connection by name
```bash
# Edit connection
$ xxh edit my_conn
```

### Help
```bash
$ man xxh
# or
$ xxh help
# or
$ xxh
```
