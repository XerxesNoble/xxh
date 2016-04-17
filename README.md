# xxh

SSH connection manager built in python. Sets up your rsa keys for you because life should be easy for the lazy programmer.

### Install
```bash
$ npm install xxh -g
```

### Connect
```bash
# Start SSH session
$ xxh my_conn
```

### Add

```bash
# Add connection without rsa setup
$ xxh add my_conn user@connection.name.com

# Add connection with rsa setup
$ xxh add -p my_conn user@connection.name.com
```

### List
```bash
# List all connections
$ xxh list

# List all connections with more info
$ xxh list -v
```

### Delete

```bash
# Note: this does NOT remove the rsa keys

# Delete connection
$ xxh delete my_conn

# Delete all connections
$ xxh delete --all
```

### Edit
```bash
# Edit connection
$ xxh edit my_conn
```

### Help
```bash
# Show help
$ xxh help

# or just

$ xxh

```