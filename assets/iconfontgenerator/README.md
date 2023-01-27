### How to generate new fonts

1. Add your new font(s) in SVG format to the `assets/icons` folder. Be sure there are no extraneous values, only the svg tag and its contents, otherwise svgtofont won't generate CSS/less files.

2. Within the iconfontgenerator folder, run the command `node createfonts.js`. That generates the following:

- font files in [LOCAL_COUCHDB_REPO]/couchdb-fauxton/assets/fonts
  * `[font name].eot` 
  * `[font name].svg`
  * `[font name].symbol.svg`
  * `[font name].ttf`
  * `[font name].woff` 
  * `[font name].woff2` 

3. This will overwrite the previous font files and the new icons will be ready to use. All available icons will be in `icons.less` which can be found in [LOCAL_COUCHDB_REPO]/couchdb-fauxton/assets/less.