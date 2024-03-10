const path = require('path');
const fg = require("fast-glob");

let pagesArray = []; // [ page path, subdirectory depth, public path, output path ]
fg.sync(["dev/**/*index.html"]).forEach(file => {
    const subDirDepth = (file.split("/")).length - 1;
    pagesArray.push([
        file,
        subDirDepth,
        ((subDirDepth > 1) ? "../".repeat(subDirDepth) : ""),
        file.replace("dev/", "")
    ]);
})
console.info("-->", pagesArray.length, "pages", pagesArray, "\n");

module.exports = {
    PAGES: pagesArray,
    assets: path.resolve(__dirname, '../dev/assets'),
    dev: path.resolve(__dirname, '../dev'),
    //build: path.resolve(__dirname, '../_build'),
    //buildDev: path.resolve(__dirname, '../_build/dev'),
    build: path.resolve(__dirname, '../yolan-design.github.io'),
    buildDev: path.resolve(__dirname, '../yolan-design.github.io/dev'),
}
