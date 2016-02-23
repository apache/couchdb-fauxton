*WARNING:  this is a temporary solution for adding icons to the Icon Font. This will become a grunt task eventually.*

This is a temp solution till Fontcustom fixes this [BUG](https://github.com/FontCustom/fontcustom/issues/172)<br>

### Installation

1. Requires **Bundler.io**, **Ruby 1.9.2+**, **FontForge** with Python scripting.

```sh
# On Mac
$ gem install bundler
$ brew install fontforge eot-utils
$ cd [LOCAL_COUCHDB_REPO]/src/couchdb-fauxton/assets/fonts
$ bundle
```

That should install the gem in a path like below:
/Users/[USERNAME]/.rvm/gems/[RUBYVERSION]/bundler/gems/fontcustom

2. Update `fontcustom.yml` with the correct paths where it says `PUT_YOUR_PATH_HERE`.

3. Update the `font_name` value to generate a new filename for the font files. This is necessary for browser cache-busting.

4. Add your new font(s) in SVG format to the `assets/icons` folder.

5. If Gemfile.lock exists, delete it. The run `bundle install`

6. Run the command `bundle exec fontcustom compile`. That generates the following:

- an `icons.less` file [LOCAL_COUCHDB_REPO]/src/couchdb-fauxton/assets/less
- a `fauxtonicon-preview.html` preview [LOCAL_COUCHDB_REPO]/src/couchdb-fauxton/assets/fonts/styleguide
- font files in [LOCAL_COUCHDB_REPO]/src/couchdb-fauxton/assets/fonts/
  * `[font name].eot` 
  * `[font name].svg`
  * `[font name].ttf`
  * `[font name].woff` 

7. Delete the old fauxtoniconX.*** files, and ./styleguide/fauxtoniconX-preview.html file.

For more info on Fontcustom, check out their documenation: [Fontcustom documentation](https://github.com/FontCustom/fontcustom)

For more info on Bundler, check out their documentation:  [Bundler documentation](http://bundler.io)


[Licenses](https://github.com/FontCustom/fontcustom/blob/master/LICENSES.txt)
