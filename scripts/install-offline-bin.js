'use strict';

const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'node_modules', '.bin');
const bin = path.join(binDir, 'gatsby');

if (!fs.existsSync(binDir)) {
    process.exit(0);
}

// The published shim is a symlink into the package. Unlink it first so
// the write does not replace Gatsby's own CLI file.
if (fs.existsSync(bin)) {
    fs.unlinkSync(bin);
}

fs.writeFileSync(
    bin,
    '#!/usr/bin/env node\n' +
        "'use strict';\n" +
        "require('../../scripts/gatsby.js');\n",
    { mode: 0o755 }
);
