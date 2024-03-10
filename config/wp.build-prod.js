// WEBPACK 5 CONFIG
// - BUILD PRODUCTION
// - final production build

const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");

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

    // Customize build process
    plugins: [
        // Duplicate assets to build folder
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: PATHS.dev + "/public",
                    to: PATHS.build + "/",
                    globOptions: {
                        ignore: ['*.DS_Store', 'Thumbs.db', "**/.git"],
                    },
                    //noErrorOnMissing: true,
                },
            ],
        }),
    ],
})