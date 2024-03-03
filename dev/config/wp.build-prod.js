// WEBPACK 5 CONFIG
// - BUILD PRODUCTION
// - final production build

const { merge } = require("webpack-merge");

const PATHS = require('./paths');
const wpBASE = require('./wp.base-build');

// CONFIG
module.exports = merge(wpBASE, {
    mode: 'production',
    devtool: false, // no source maps

    // Where everything goes at the end
    output: {
        path: PATHS.build,
    },
})