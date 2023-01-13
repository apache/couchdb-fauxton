const svgtofont = require("svgtofont");
const path = require("path");

svgtofont({
  emptyDist: true, // Clear output directory contents
  src: "../icons", // svg path
  dist: path.resolve(process.cwd(), "fonts"), // output path
  styleTemplates: path.resolve(process.cwd(), "styles"), // file templates path (optional)
  fontName: "fauxtonicon6", // font name
  css: {
    fileName: 'icons',
    cssPath: '../fonts/'
  }, // Create CSS files.
  startUnicode: 0xea01, // unicode start number
  classNamePrefix: "fonticon",
  svgicons2svgfont: {
    fontHeight: 1000,
    normalize: true
  },
  website: null,
}).then(() => {
  console.log('done!');
});