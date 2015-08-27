# Writing Addons

Addons allow you to extend Fauxton to do anything you may need. Perhaps you have some custom requirements not
met by the core script, or you just wanted to experiment. This page contains a little info on how to write your own.

Addons are usually stored in `/app/addons` in their own subfolder, and have the following structure:

* base.js - _entry point to the addon_
* resources.js - _models and collections of the addon_
* routes.js - _URL routing for the addon_
* components.react.jsx - _React components (views)_

In addition, you may find you need to include CSS or external resources. For that, include a `assets/less` or 
`assets/external` folder.


## Generating an Addon

We have a convenient `grunt-init` template that lets you create a skeleton Fauxton addon with some boilerplate 
code. 

- On the command line, go to your Fauxton folder and run `./node_modules/.bin/grunt-init tasks/addon` and 
answer the questions it asks. It'll go something like this:

```shell
$ ./node_modules/.bin/grunt-init tasks/addon
path.existsSync is now called `fs.existsSync`.
Running "addon" task

Please answer the following:
[?] Add on Name (WickedCool) SuperAddon
[?] Location of add ons (app/addons)
[?] Do you need an assets folder?(for .less) (y/N)
[?] Do you need to make any changes to the above before continuing? (y/N)

Created addon SuperAddon in app/addons

Done, without errors.
```

- Now take a look at your `app/addons/[AddonName]` folder to see what it's created for you. Notice that at this stage, the 
`components.react.jsx` file doesn't have a corresponding `.js` file. JSX files are files that are precompiled into 
javascript.

- To add your new addon for inclusion in Fauxton, edit your `settings.json` file (or `settings.json.default` if it 
doesn't exist). That file defines exactly which addons gets loaded. Editing that file, you'll see something like this 
towards the top:

```javascript
"deps": [
  { "name": "fauxton" },
  { "name": "components" },
  { "name": "databases" },
  { "name": "documents" },
  { "name": "activetasks" },
  { "name": "cluster" },
  // ...
  ],
```

There, just add a new row for your new addon.

```javascript
  { "name": "[AddonName]" },
```

(obviously replace `[AddonName]` with your addon name). 

4. Restart Fauxton (`grunt dev`) and look for a new primary nav item appear the left with your addon name. Click that 
and you should see a Hello World. Nice! Check out your component folder again: note that `component.react.js` now 
exists. That's what's being used in Fauxton when it loads in your browser.


## Some starter tips

### Route Objects

Like any web app, Fauxton uses URLs (hashes, in our case) to determine what code should be loaded to populate 
the page. The `routes.js` file contains one or more "route objects" (it returns an array) each of which 
define URL path matches - just like a Backbone router.
 
In this example addon, see that it has a single `example/addon` path defined. When the hash matches that string, it will
execute the function defined as its key. That then loads the React component found in your `components.react.jsx` file.

For more examples of how the Route Objects function, look through some of the existing code. 

#### Layout templates

You may have noticed the `layout: 'one_pane'` property of the route object in your addon. By and large, there aren't that
many combinations of overall page layouts within Fauxton. That setting lets you choose a pre-existing template to help
cut down on boilerplate code. 

For a full list of the available templates, see the `app/templates` folder. To use any of them, just include the 
filename, minus the `.html` extension.


### React Components & JSX

If you're not familiar with React you should definitely check out their website for more info. JSX is optional, but
we've found it extremely useful so the compiler is baked into the `grunt dev` task and compiled your JSX files on the 
fly as you edit them. 


### CSS / Less

Fauxton uses Less for its CSS precompilation. If you include a file with the name `[AddonName].less` in your addon's 
`/assets/less` folder, it will be automatically included when Fauxton starts.

### Icons

Take a look at `base.js` to see how your addon was added to the primary nav. To see the list of available icons 
that can be used within Fauxton, check out the preview page at: 
`http://localhost:8000/assets/fonts/styleguide/fauxtonicon-preview.html`. That's a handy reference in case you find 
you need an icon or two.
