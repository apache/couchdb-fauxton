const svgtofont = require("svgtofont");
const path = require("path");
const fs = require("fs");

if (process.argv.length != 3) {
  console.error(`Usage: node createfonts.js [font-name]`);
  console.error(
    `where [font-name] must follow the format "fauxtonicon[INTEGER]"`
  );
  process.exit(1);
}

if (!process.argv[2].startsWith("fauxtonicon")) {
  console.error(
    `Invalid value: ${process.argv[2]}. Font name must follow the format "fauxtonicon[INTEGER]"`
  );
  process.exit(1);
}

const fauxtonFontname = process.argv[2];
const generatedFontsDir = "generated";

// Generate the font files (.ttf, .woff, etc) and LESS file
svgtofont({
  emptyDist: true, // Clear output directory contents
  src: "../icons", // svg path
  dist: path.resolve(process.cwd(), generatedFontsDir), // output path
  styleTemplates: path.resolve(process.cwd(), "styles"), // file templates path
  fontName: fauxtonFontname, // font name
  css: {
    fileName: "icons",
    cssPath: "../fonts/",
  }, // Create CSS files.
  startUnicode: 0xea01, // unicode start number
  classNamePrefix: "fonticon",
  svgicons2svgfont: {
    fontHeight: 1000,
    normalize: true,
    descent: 64,
  },
  website: null,
}).then(() => {
  console.log(`Font ${fauxtonFontname} generated`);
  try {
    // The custom template ../styles/icons.less includes the '{{cssToVars}}' variable so the generator adds the list of icons as variables.
    // The problem is that {{cssToVars}} is written in SCSS syntax, so we need to convert it to LESS syntax, which comes down
    // to replacing '$<var_name>' to '@<var_name>'.
    const original = fs.readFileSync("./generated/icons.less", "utf8");
    const updated = original.replaceAll("$fonticon-", "@fonticon-");
    fs.writeFileSync("./generated/icons.less", updated);

    // Remove old icons font files
    const fontsDir = "../fonts";
    fs.readdirSync(fontsDir).forEach((file) => {
      if (file.startsWith("fauxtonicon")) {
        const toDelete = fontsDir + "/" + file;
        console.log("Deleting", toDelete);
        fs.unlinkSync(toDelete);
      }
    });

    // Add new icons font files
    fs.readdirSync(generatedFontsDir).forEach((file) => {
      if (file.startsWith("fauxtonicon")) {
        const from = generatedFontsDir + "/" + file;
        const to = fontsDir + "/" + file;
        console.log("Moving", from, "to", to);
        fs.renameSync(from, to);
      }
    });

    // Replace 'assets/less/icons.less' with the newly generated version
    const iconsLess = "../less/icons.less";
    console.log(`Replacing ${iconsLess} with the new version`);
    if (fs.existsSync(iconsLess)) {
      fs.unlinkSync(iconsLess);
    }
    const generatedIconsLess = generatedFontsDir + "/icons.less";
    fs.renameSync(generatedIconsLess, iconsLess);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
