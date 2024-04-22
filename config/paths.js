const path = require('path');
const fg = require("fast-glob");

let pagesArray = []; // [ page path, subdirectory depth, public path, output path ]
fg.sync(["dev/**/*index.html"]).forEach(file => {
    const subDirDepth = (file.split("/")).length - 2;
    pagesArray.push([
        file,
        subDirDepth,
        ((subDirDepth > 0) ? "../".repeat(subDirDepth) : ""),
        file.replace("dev/", "")
    ]);
})
console.info("<->", pagesArray.length, "\u001b[1;32mpage"+((pagesArray.length>1) ? "s" : "") +"\u001b[0m");
for (let i = 0; i < pagesArray.length; i++) {
    console.log("<"+(i+1)+">", "\u001b[1;30m"+ pagesArray[i].join(' · ') +"\u001b[0m");
}
console.info("\n");

module.exports = {
    PAGES: pagesArray,
    assets: path.resolve(__dirname, '../dev/assets'),
    dev: path.resolve(__dirname, '../dev'),
    //build: path.resolve(__dirname, '../_build'),
    //buildDev: path.resolve(__dirname, '../_build/dev'),
    build: path.resolve(__dirname, '../yolan-design.github.io'),
    buildDev: path.resolve(__dirname, '../yolan-design.github.io/dev'),
}
