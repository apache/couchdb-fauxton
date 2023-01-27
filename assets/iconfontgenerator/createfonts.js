const svgtofont = require("svgtofont");
const path = require("path");
const fauxtonFontname = "fauxtonicon6";
const generatedFontsDir = "generated";

// Generate the font files (.ttf, .woff, etc) and LESS file
svgtofont({
  emptyDist: true, // Clear output directory contents
  src: "../icons", // svg path
  dist: path.resolve(process.cwd(), generatedFontsDir), // output path
  styleTemplates: path.resolve(process.cwd(), "styles"), // file templates path (optional)
  fontName: fauxtonFontname, // font name
  css: {
    fileName: 'icons',
    cssPath: '../fonts/'
  }, // Create CSS files.
  startUnicode: 0xea01, // unicode start number
  classNamePrefix: "fonticon",
  svgicons2svgfont: {
    fontHeight: 1000,
    normalize: true,
    descent:64,
  },
  website: null,
}).then(() => {
  console.log('new fonts generated');

  // The custom template ../styles/icons.less includes the '{{cssToVars}}' so the generator adds the list of icons as variables.
  // The problem is that {{cssToVars}} only supports SCSS syntax, so we need to convert it to LESS syntax, which comes down 
  // to replacing '$<var_name>' to '@<var_name>'.

  const fs = require('fs');
  try {
    const original = fs.readFileSync('./generated/icons.less', 'utf8');
    const updated = original.replaceAll("$fonticon-", "@fonticon-");
    fs.writeFileSync('./generated/icons.less', updated);

    // removing old icons font files
    const fontsDir = '../fonts';
    fs.readdirSync(fontsDir).forEach(file => {
      if (file.startsWith('fauxtonicon')) {
        const toDelete = fontsDir+'/'+file;
        console.log('Deleting', toDelete);
        fs.unlinkSync(toDelete);
      }
    });

    // add new icons font files
    fs.readdirSync(generatedFontsDir).forEach(file => {
      if (file.startsWith('fauxtonicon')) {
        const from = generatedFontsDir + '/' + file;
        const to = fontsDir + '/' + file;
        console.log('Moving', from, 'to', to);
        fs.renameSync(from, to);
      }
    });

    const iconsLess = '../less/icons.less';
    if (fs.existsSync(iconsLess)) {
      console.log('Deleting old icons.less', iconsLess);
      fs.unlinkSync(iconsLess);
    }
    const generatedIconsLess = generatedFontsDir + '/icons.less';
    fs.renameSync(generatedIconsLess, iconsLess);
  } catch (err) {
    console.error(err);
  }
});
