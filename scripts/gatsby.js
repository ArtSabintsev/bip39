#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
let md4Works = true;
try {
    crypto.createHash('md4');
} catch (err) {
    md4Works = false;
}

// Webpack 4 hashes with MD4. Node 17+ rejects that unless this process
// was started with --openssl-legacy-provider.
if (!md4Works && !process.env.BIP39_OPENSSL_LEGACY) {
    const { spawn } = require('child_process');
    const env = Object.assign({}, process.env, {
        BIP39_OPENSSL_LEGACY: '1',
        NODE_OPTIONS: [process.env.NODE_OPTIONS, '--openssl-legacy-provider']
            .filter(Boolean)
            .join(' '),
    });
    const child = spawn(process.execPath, process.argv.slice(1), {
        stdio: 'inherit',
        env,
    });
    child.on('exit', (code, signal) => {
        if (signal) {
            process.kill(process.pid, signal);
        } else {
            process.exit(code == null ? 1 : code);
        }
    });
    return;
}

require('./offline-guard');

const path = require('path');

function loadCli() {
    try {
        require('gatsby-cli');
    } catch (err) {
        const gatsbyDir = path.dirname(require.resolve('gatsby/package.json'));
        require(path.join(gatsbyDir, 'node_modules', 'gatsby-cli'));
    }
}

loadCli();
