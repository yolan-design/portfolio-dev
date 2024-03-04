// WEBPACK 5 CONFIG
// - BASE
// - general config

const path = require("path");
const fg = require("fast-glob");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');

const PATHS = require('./paths');

let PAGES = []; // [ page path, subdirectory depth, public path ]
fg.sync(["*index.html", "*/index.html"]).forEach(file => {
    if(!file.includes("build/")) {
        const subDirDepth = (file.split("/")).length - 1;
        PAGES.push([ file, subDirDepth, ((subDirDepth > 0 ) ? "../".repeat(subDirDepth) : "") ]);
    }
})
console.info("-->", PAGES.length, "pages", PAGES, "\n");

// CONFIG
module.exports = {
    // From where it all starts
    entry: {
        app: PATHS.dev + "/main.js"
    },

    // Where everything goes at the end
    output: {
        path: PATHS.build,
        filename: "app.[contenthash].js",

        // asset type modules name
        /*assetModuleFilename: (pathData) => {
            const filepath = path.dirname(pathData.filename).split("/").slice(1).join("/");
            return filepath + "/[name][ext]";
        }*/
    },

    // How modules are treated
    module: {
        rules: [
            // JS : use babel to transpile
            { test: /\.js$/i, use: 'babel-loader' },

            // Images
            //{ test: /\.(ico|gif|png|jpe?g|svg)$/i, type: 'asset/resource' },

            // Fonts
            //{ test: /\.(woff(2)?|eot|ttf|otf)$/i, type: 'asset/resource' },
        ],
    },

    // Will replace aliases with paths
    resolve: {
        modules: [PATHS.dev, 'node_modules'],
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            "@dev": PATHS.dev,
            "@assets": PATHS.assets,
        },
    },

    // Customize build process
    plugins: [
        // Print build progress
        new webpack.ProgressPlugin(),

        // Generate HTML file for each page
        ...PAGES.map(pagePath =>
            new HtmlWebpackPlugin({
                template: pagePath[0], // input file
                filename: pagePath[0], // output file
                publicPath: pagePath[2],

                inject : "body",
                scriptLoading : "module",
                minify: false,

                head_settings : `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="icon" type="image/svg+xml" href="${pagePath[2]}assets/favicons/favicon-y.svg">
    <link rel="alternate icon" type="image/png" sizes="64x64" href="${pagePath[2]}assets/favicons/favicon-64.png">
    <link rel="alternate icon" type="image/png" sizes="32x32" href="${pagePath[2]}assets/favicons/favicon-32.png">
    <link rel="alternate icon" type="image/png" sizes="16x16" href="${pagePath[2]}assets/favicons/favicon-16.png">
                `,
            })
          ),
          new HtmlInlineScriptPlugin({
            scriptMatchPattern: [/app.+[.]css$/],
            //htmlMatchPattern: [/index.html$/],
          }),
    ],
}
