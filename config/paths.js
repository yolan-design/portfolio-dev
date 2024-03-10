const path = require('path');
const fg = require("fast-glob");

let pagesArray = []; // [ page path, subdirectory depth, public path ]
fg.sync(["*index.html", "*/index.html"]).forEach(file => {
    if (!file.includes("build/") && !file.includes(".github.io")) {
        const subDirDepth = (file.split("/")).length - 1;
        pagesArray.push([file, subDirDepth, ((subDirDepth > 0) ? "../".repeat(subDirDepth) : "")]);
    }
})
console.info("-->", pagesArray.length, "pages", pagesArray, "\n");

module.exports = {
    PAGES: pagesArray,
    assets: path.resolve(__dirname, '../assets'),
    dev: path.resolve(__dirname, '../dev'),
    //build: path.resolve(__dirname, '../_build'),
    //buildDev: path.resolve(__dirname, '../_build/dev'),
    build: path.resolve(__dirname, '../yolan-design.github.io'),
    buildDev: path.resolve(__dirname, '../yolan-design.github.io/dev'),
}
