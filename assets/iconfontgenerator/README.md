### How to generate new fonts

1. Add your new font(s) in SVG format to the `assets/icons` folder. Be sure there are no extraneous values, only the svg tag and its contents, otherwise svgtofont won't generate css files

2. Within the iconfontgenerator folder, run the command `node createfonts.js`. That generates the following:

- font files in [LOCAL_COUCHDB_REPO]/couchdb-fauxton/assets/iconfontgenerator/fonts
  * `[font name].eot` 
  * `[font name].svg`
  * `[font name].symbol.svg`
  * `[font name].ttf`
  * `[font name].woff` 
  * `[font name].woff2` 
  * `icons.less`

3. Still within the iconfontgenerator folder, move these files to the appropriate folders with the command 
    `mv fonts/icons.less ../less/. && mv fonts/fauxtonicon6.* ../fonts/.`
This will overwrite the previous font files and the new icons will be ready to use.