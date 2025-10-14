const settings = require('./System');
let bots = [];
if (settings.Welcome.Tokens.length > 0)
    bots.push({
        name: settings.serverName + '-Welcomes',
        namespace: 'ares',
        script: 'index.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './ares/Welcome/',
        args: ['--color', '--watch'],
    });

if (settings.Private.Token)
    bots.push({
        name: settings.serverName + '-Private',
        namespace: 'ares',
        script: 'index.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './ares/Private/',
        args: ['--color', '--watch'],
    });

if (settings.Security.Logger)
    bots.push({
        name: settings.serverName + '-Logger',
        namespace: 'ares',
        script: 'index.js', 
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './ares/Guard/I',
        args: ['--color', '--watch'],
    });

if (settings.Security.Punish)
    bots.push({
        name: settings.serverName + '-Punish',
        namespace: 'ares',
        script: 'index.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './ares/Guard/II',
        args: ['--color', '--watch'],
    });

if (settings.Security.Backup)
    bots.push({
        name: settings.serverName + '-Backup',
        namespace: 'ares',
        script: 'index.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './ares/Guard/III',
        args: ['--color', '--watch'],
    });

module.exports = { apps: bots };