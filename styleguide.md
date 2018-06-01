# Style Guide

This document attempts to codify the JavaScript, HTML and CSS style rules for Fauxton. This has been patched together from
a few sources, including [Pootle's style guide](http://pootle.readthedocs.org/en/latest/developers/styleguide.html),
[Google JS style guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml), and from
reverse-engineering our own codebase.

This is intended to be a living document: any disagreements about style should be brought to the community via the
[mailing list](http://markmail.org/search/?q=couchdb#query:couchdb%20list%3Aorg.apache.couchdb.dev%20order%3Adate-backward),
discussed, agreed upon and documented here.

- [Javascript](#js)
- [HTML](#html)
- [CSS / Less](#css)


<a name="js" />

## JavaScript

Note: We have JSHint running as a grunt task which will catch the more egregious errors (missing `vars`, missing
semicolons etc). See the `Gruntfile.js` for the settings being used.

### Programming Style

#### Indentation
- 2-space indentation. Don't use tabs. JSHint will whine if you have mixed tabs and spaces.
- Avoid lines longer than 120 characters.

#### Whitespace
- For anonymous function calls there should be one space between the word `function` and the `(` (left parenthesis).
Similarly, for named functions there should be a space between the function name `myFunction` and the opening parenthesis.
- Control statements should have one space between the control keyword and opening parenthesis.
- Each `;` (semicolon) in the control part of a for statement should be followed with a space.
- Every `,` (comma) should be followed with whitespace.

#### Strings
Use `'` single quote character for strings, because HTML markup uses `"`. Eg. `var greeting = 'Hello World!'`;

#### Numbers
When using `parseInt` always explicitly include the second radix argument (usually 10).

#### Variables
- use camel case for variables and methods: `myVariable`, `myMethod`
- use upper camel case (Pascal) for classes / uninstantiated objects: `MyModel`, `MyView`
- If a variable holds a jQuery object, prefix it by a dollar sign `$`. For example:

```javascript
var $ul = $('#myList');
```

#### Selectors
- Prefix selectors that deal with JavaScript with `js-`. This way it’s clear the separation between class selectors that
deal with presentation (CSS) and functionality (JavaScript).
- Use the same naming criterion as with CSS selector names, ie, lowercase and consequent words separated by dashes.
- Inside Backbone Views, always use `this.$("...")` to target elements, even IDs.

#### Control statements
Use Underscore's more concise looping methods (`_.each`, `_.filter`) over plain vanilla `for` loops.

Control statements such as `if`, `while`, `switch` should follow these rules:
- The enclosed statements should be indented.
- The `{` (left curly brace) should be at the end of the line that begins the compound statement.
- The `}` (right curly brace) should begin a line and be indented to align with the beginning of the line containing
the matching `{` (left curly brace).
- Braces should be used around all statements, even single statements, when they are part of a control structure,
such as an `if` or `while` statement. This makes it easier to add statements without accidentally introducing bugs.

#### expr ? yay : nay ternary operator
- use only for simple logic; anything more complex can become difficult to read.

#### Avoid changing a variable's type
Once you have create a variable and assigned a value, it is set as a type, stick with that type for that variable. This
has performance benefits as well as making it easier for someone to understand your code.

Bad:
```javascript
var greeting = 'Hello World!';
greeting = function () {
  return 'Goodbye World';
};
```

Special cases for `null` and `undefined` since they're their own type. It's fine to assign a new value to an undefined
or null var.

#### Binding
To maintain calling context, favour `_.bind` over storing a reference to `this`. If you do, use `that` as a var name
(`var that = this;`)

#### Object Prototypes
Do not modify any native objects' prototype. eg. `Array.prototype`.

#### Object Constructors
Avoid using constructors for the built-in object types: Number, String, Boolean, Array, Object.

Number:
```javascript
var x = 10; // good
var x = new Number(10); // bad
```

String:
```javascript
var greeting = 'Hello'; // good
var greeting = new String('Hello'); // bad
```

Boolean:
```javascript
var yes = true; // good
var yes = new Boolean(1); // bad
```

Array:
```javascript
var myList = new Array(1, 2, 3); // nope
var myList = [1, 2, 3]; // yay!
```

Object:
```javascript
var myObj = { size: 10 }; // hurrah!
var myObj = new Object(); // boooo!
```

#### Associative Arrays
Use object literal notation for map/hash/associative arrays.


### Examples

#### `if` statements

```javascript
if (condition) {
  statements
}

if (condition) {
  statements
} else {
  statements
}

if (condition) {
  statements
} else if (condition) {
  statements
} else {
  statements
}
```

#### `for` statements

As mentioned above, using Underscore's looping methods is favoured here.

```javascript
for (initialization; condition; update) {
  statements;
}

for (variable in object) {
  if (condition) {
    statements
  }
}
```

#### `switch` statements

```javascript
switch (condition) {
  case 1:
    statements
    break;

  case 2:
    statements
    break;

  default:
    statements
}
```

#### Functions

```javascript
function myFunction () {
  // stuff!
}

function anotherFunction (firstParam, secondParam, thirdParam) {
  // stuff!
}

var yetAnotherFunction = function (firstParam) {
  // stuff!
}

var anonymousFunction = function () {
  // more stuff!
}
```


<a name="html" />

## HTML

In Fauxton, all our HTML documents are all Underscore templates so this section contains a few Underscore-related 
style recommendations as well.

#### Indentation
- 2-space indentation using spaces, not tabs.
- Avoid lines longer than 120 characters.

### Naming
- IDs and class names with multiple words should be lowercase and separated with hyphens (`-`), like `my-class` and 
`fixed-header`.
- Please try to name your classes and IDs something that makes sense for the current component and won't conflict with
other markup in the page.
- IDs or classes that are to be used for javascript only should be named with a `js-` prefix. Note: these should NOT be 
styled; they should be used for JS hooks only.

#### Other
- Always use double quotes for attribute strings.

### Underscore-related
- If a template name consists of multiple words, separate it with underscores, like `my_template.html`.
- Unless they're explicitly needed, always use `<%- %>` over `<%= %>`.



<a name="css" />

## CSS / Less

We use Less to generate our CSS.

#### Indentation / Whitespace
- Indent using 2 spaces. Don’t use tabs.
- Put selectors and braces on their own lines.
- One space between the end of the selector and the opening brace, e.g. 
 
```
.my-class {
    /* rules here */
}
```

#### Naming 
- As noted in the HTML section above, selectors should be lowercase. 
- Selectors with multiple words should be separated with hyphens (`-`), like `.my-class` and `.fixed-header`. 

#### Other
- Avoid deep-nesting of rules. Always try to style an element with the minimum specificity required.


