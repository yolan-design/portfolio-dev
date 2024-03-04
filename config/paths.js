const path = require('path')

module.exports = {
    assets: path.resolve(__dirname, '../assets'),
    dev: path.resolve(__dirname, '../dev'),
    //build: path.resolve(__dirname, '../_build'),
    //buildDev: path.resolve(__dirname, '../_build/dev'),
    build: path.resolve(__dirname, '../yolan-design.github.io'),
    buildDev: path.resolve(__dirname, '../yolan-design.github.io/dev'),
}
