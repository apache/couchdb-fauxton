#From `define` to `import`

To run the ast to change a file from using amd to es6 import follow these steps:

* npm i -g jscodeshift
* npm install 5to6-codemod
* Replace `./node_modules/5to6-codemod/transforms/amd.js` with https://gist.github.com/robertkowalski/9167d45c0af6b9abdd4b51a09ef4e039
* run `jscodeshift --extensions=js,jsx -t node_modules/5to6-codemod/transforms/amd.js app/file/name`
* run git diff to check
