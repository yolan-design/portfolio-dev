// WEBPACK 5 CONFIG
// - DEV
// - localhost with hot reloading

const { merge } = require("webpack-merge");

const PATHS = require('./paths');
const wpBASE = require('./wp.base');

// CONFIG
module.exports = merge(wpBASE, {
    mode: 'development',
    devtool: 'eval-source-map',

    // Local server at http://localhost:8888 with hot reloading
    devServer: {
        static: [
            {
                directory: PATHS.dev,
                publicPath: '/',
                watch: true,
            },
        ],
        client: {
            progress: true,
            overlay: {
                errors: true,
                warnings: true
            },
        },
        // historyApiFallback: true, // redirect to home page instead of 404
        // open: true,
        liveReload: true,
        compress: true,
        hot: true,
        host: 'localhost',
        port: 8888,
    },

    /* File watcher options */
    watchOptions: {
      aggregateTimeout: 175,
      poll: 300,
      ignored: /node_modules/,
    },


})