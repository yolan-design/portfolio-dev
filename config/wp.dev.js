// WEBPACK 5 CONFIG
// - DEV
// - localhost with hot reloading

const { merge } = require("webpack-merge");

const PATHS = require('./paths');
const wpBASE = require('./wp.base');

// CONFIG
module.exports = merge(wpBASE, {
    mode: 'development',
    devtool: 'inline-source-map', // source maps

    // Local server at http://localhost:8888 with hot reloading
    devServer: {
        static: "./",
        historyApiFallback: true,
        compress: true,
        hot: true,
        port: 8888,
        client: {
          overlay: {
            errors: true,
            warnings: true
          },
        }
    },

    module: {
        rules: [
            // Inject CSS in head with source maps
            {
                test: /\.(sa|sc)ss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true, importLoaders: 1, modules: false },
                    },
                    { loader: 'postcss-loader', options: { sourceMap: true } },
                    { loader: 'sass-loader', options: { sourceMap: true } },
                ],
            },
        ],
    },
})