# Fauxton Code Overview

This page documents a little practical information about the Fauxton codebase to help you get up to speed. 


## Backbone and React 

Fauxton was originally written in [Backbone](http://backbonejs.org), but in 2015 we're in the process of upgrading 
the codebase to build it around [React](https://facebook.github.io/react/). We're replacing all Backbone Views with 
(unit-tested!) React components. Backbone models and collections are still being used for server-side data retrieval 
and storage as is URL routing, but the plan is to phase out all Backbone over time. 

### React and the Flux pattern

You can read more about [React](https://facebook.github.io/react/) and [Flux](https://facebook.github.io/flux/docs/overview.html) 
on their sites, but a few quick words about both. 

React is a relatively new framework created by Facebook, built on the idea of automatic DOM re-renders. Contrary to other
frameworks, React decides when and where to redraw your UI based on changes to the underlying data set - and uses 
a *virtual DOM* to handle the re-rendering. The key decisions to moving to React were simplicity, performance and 
ease of testing. Check out [this page](https://facebook.github.io/react/docs/why-react.html) for a few more remarks.

Flux is primarily a *pattern* for keeping your code organized over time. One of its key ideas is to have *one-way 
communication* as shown in the [diagram here](https://github.com/facebook/flux). 

Note that Fauxton has no dependency with the Flux code as it implements its own dispatcher and reduce stores. The information flows like this:

1. User clicks on something in a React component, 
2. the component fires an action (in an `actions.js` file),
3. the action dispatches an event (for us, that's the `FauxtonAPI.dispatch()` call), 
4. stores listen to these events (in their `dispatch()` methods), change the content of the store, then notify 
anyone that's interested that the store has changed,
5. finally, it comes full circle. React components listen for changes in the store by listening to their `change` 
events. That's the purpose of the `storeName.on('change', this.onChange)` lines you'll see in the code.

So why do all this. The benefit is that it standardizes how data moves around the application, and keeps things 
simple - regardless of how much bigger the application gets. This is pretty cool.

Here's a simple example: imagine if a user shrunk/expanded the main sidebar, and multiple components in the page 
needed to know about it to make use of the new space. Maybe one was a graph and needed to redraw for the extra space, 
and maybe another component could switch from "basic" to "advanced" view or something.

With this pattern, you can just publish the single event, then each store could listen for it, change whatever data was needed 
internally, then notify any components that was listening: and they would then have the choice to rerender or not, 
based on what changed. This is basic "pub/sub": allowing you to keep code loosely coupled, but still communicate.

### Moving to Redux

There are a few drawbacks in the implementation above though. For instance the reduce stores rely on Backbone. 

For this reason and others, it's encouraged that new components use Redux (https://github.com/reactjs/redux), which follows the same principles as Flux. Additionally, use React Redux (https://github.com/reactjs/react-redux) to easily connect a Redux store to your React components.

## Addons

Each bit of functionality is its own separate module or addon. Addons are located in their own `app/addons/myaddon-name` 
folder. As noted above, new code is being written in React so please favour React components over backbone views.

A good place to get started is to read through a couple of the existing addons. A good starting point is 
[app/addons/verifyinstall](app/addons/verifyinstall). This is relatively self-contained and maps to a specific page in 
the Fauxton interface so you can see exactly where it appears and what it does.

Each module must have a `base.js` file, this is read and compiled when Fauxton is deployed. A `resources.js` file
is usually used for your Backbone.Models and Backbone.Collections, `components.js` for your React components.
The `routes.js` is used to register one or more URL paths for your addon along with what layout, data, breadcrumbs and API
point is required for the view.

Check out [writing_addons.md](writing_addons.md) for more information on writing your own addons.


## CSS / Less

We use Less for generating our CSS. The bulk of the shared CSS used throughout the application is found in 
[assets/less/](assets/less), but any addon may contain its own `assets/less` subfolder containing whatever unique
styles are needed.


## app/addons/components / app/addons/fauxton
  
These two contain React components and functionality intended for sharing throughout the app. You'll find many 
common elements in there, like trays, buttons, loading lines, clipboard functionality and more.


