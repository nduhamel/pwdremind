# Pwdremind
******

### Project description
Pwdremind is an awesome application! It lets you store your important data : logins, passwords, notes on your server.

### Is it secured ?
Yes! It's a zero-knowledge application. The server can't read your data, everything is encrypted. Even the connection between the client and the server is encrypted.

For authentication and client / server encryption we use the [SRP (Secure Remote Password)](http://srp.stanford.edu/) protocol from Stanford.

## Installation

The only thing you need to setup is your database. Pwdremind support MySQL, SQLite and PostgreSQL.

### User friendly installation
We have build an user friendly installer. Copy the file to you web server and go to the `install` folder. Follow the steps and **when you're done, delete the install folder.**

### Geek installation
You can still install it manually. Just rename the `config.php-dist` to `config.php` and edit it with your own database configurations.

To init the database and add users you should use our `script` folder.
**When you're done delete the install folder.**

## Build
We've haded a `grunt.js` file for build and deployment.

## Contribute
Feel free to help us!

Take a look at our [coding standards](https://github.com/nduhamel/pwdremind/wiki/Coding-standards)

