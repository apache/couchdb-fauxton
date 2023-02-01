### How to regenerate Fauxton's icon fonts

The steps below describe how to use [svgtofont](https://github.com/jaywcjlove/svgtofont) to generate a new set of
CSS and font files based on an input set of SVG icons.

**IMPORTANT**: The source SVG files can not contain any comments or metatags (e.g. `<?xml ...?>` , `<!-- -->` or `<!DOCTYPE ... >`) otherwise the `svgtofont` tool will fail.


1. Add, remove or replace SVG icons in the [assets/icons](assets/icons) folder.

2. Run `npm install svgtofont --no-save` to install the tool.

3. Then run
```
cd assets/iconfontgenerator
node createfonts.js <fauxtonicon[INTEGER]>
```

Specifiying `fauxtonicon[INTEGER]` will update the value of `fauxtonFontname` in `assets/iconfontgenerator/createfonts.js` which is the name of the new font files. This is needed because the font files are bundled as-is by Webpack, so in order to burst the browser's cache, you need to specify a different name. Take note of the current value and increment by 1 for consistency (e.g., `fauxtonicon5` --> `fauxtonicon6`)

The new CSS and font files are generated and copied to the appropriate Fauxton folders.
