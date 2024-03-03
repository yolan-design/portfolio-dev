// WEBPACK 5 CONFIG
// - BUILD DEVELOPMENT
// - test production build, will duplicate assets

const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const PATHS = require('./paths');
const wpBASE = require('./wp.base-build');

// CONFIG
module.exports = merge(wpBASE, {
    mode: 'development',
    devtool: 'inline-source-map', // source maps

    // Where everything goes at the end
    output: {
        path: PATHS.buildDev,
    },

    // Customize build process
    plugins: [
        // Duplicate assets to build folder
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: PATHS.assets,
                    to: PATHS.buildDev + "/assets",
                    globOptions: {
                        ignore: ['*.DS_Store', ".git/**"],
                    },
                    //noErrorOnMissing: true,
                },
            ],
        }),
    ],
})