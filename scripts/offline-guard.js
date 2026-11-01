'use strict';

// Set these before gatsby-cli loads. Telemetry and the update check read
// them at import time, so a later assignment does not stop the request.
process.env.GATSBY_TELEMETRY_DISABLED = '1';
process.env.NO_UPDATE_NOTIFIER = '1';

const Module = require('module');
const fs = require('fs');
const path = require('path');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
    if (typeof id === 'string' && id.indexOf('get-latest-apis') !== -1) {
        return async function getLatestAPIsOffline() {
            const apisPath = path.join(
                path.dirname(require.resolve('gatsby/package.json')),
                'apis.json'
            );
            return JSON.parse(fs.readFileSync(apisPath, 'utf8'));
        };
    }
    return originalRequire.apply(this, arguments);
};
