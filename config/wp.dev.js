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
                watch: {
                    ignored: ["**/node_modules", "**/.git"],
                },
            },
        ],
        client: {
            progress: true,
            logging: 'verbose',
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
        host: '0.0.0.0',
        port: 8888,
    },

    /* File watcher options */
    watchOptions: {
      aggregateTimeout: 175,
      poll: 300,
      ignored: ["**/node_modules", "**/.git"],
    },


})