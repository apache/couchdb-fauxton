# Contributing to Fauxton

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of
the developers managing and developing this open source project. In return,
they should reciprocate that respect in addressing your issue, assessing
changes, and helping you finalize your pull requests.

Contributions to CouchDB are governed by our [Code of Conduct][6] and a set of
[Project Bylaws][7]. Apache CouchDB itself also has a [CONTRIBUTING.md][9] if
you want to help with the larger project. Come join us!


## Contributor quick start

If you never created a pull request before, welcome :tada: :smile: [Here is a great tutorial](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)
on how to send one :)

The [Readme file](https://github.com/apache/couchdb-fauxton/blob/master/readme.md) has information about how to get the project running.

Instructions to get a dev environment up and running as fast as possible:

First, ensure that you have Node and npm installed. You should also have either CouchDB 2.0+ or PouchDB Server. The easiest to install is PouchDB Server:

```
npm install -g pouchdb-server
pouchdb-server --port 5984
```

Now that we have a CouchDB (or PouchDB Server) up and running, check out the code:

```
git clone https://github.com/apache/couchdb-fauxton
cd couchdb-fauxton
npm install
```

Next, copy `settings.json.default.json` to `settings.json`. This will be our local settings file.

In the `settings.json`, under `"development"` -> `"app"`, change the `"host"` to point to your local CouchDB or PouchDB Server, e.g.:

```js
"development": {
  /* ... */
  "app": {
    /* ... */
    "host": "http://localhost:5984"
  }
}
```

Now run:

    npm run dev

And your Fauxton dev server will be up and running at `localhost:8000`.


## Guide to Contributions

We follow our coding-styleguide to make it easier for everyone to write, read and review code: 
[https://github.com/apache/couchdb-fauxton/blob/master/styleguide.md](https://github.com/apache/couchdb-fauxton/blob/master/styleguide.md)

To start working on a specific ticket, create a branch with the GitHub Issue # followed by a traincase description of the issue.

> e.g.   1234-Added-support-for-list-functions

If there is no GH Issue for the issue you have, you don't have to create one.

Please describe the issue, how it happens and how you fixed it in the commit message. Before you submit the Pull 
Request, please run our testsuite and make sure that it passes:

```
grunt test
```

You can also open `couchdb-fauxton/test/runner.html` in a browser. Click on the headlines of the testcases to just run 
a specific test that fails - it should be faster than running the whole testsuite every time.

Commit messages should follow the following style:

```
A brief one line description < 72 chars

Followed by further explanation if needed, this should be wrapped at
around 72 characters. Most commits should reference an existing
issue

Fixes #XXX (if there is a GH Issue)
Fixes apache/couchdb#XXX (if there is a CouchDB project GH Issue)
```

When you're ready for a review, submit a Pull Request. We regularly check the PR list for Fauxton and should get back 
to you with a code review.  If no one has responded to you yet, you can find us on [Freenode IRC in #couchdb-dev][8].
Ping **garren**, **robertkowalski** or **michellep** though anyone in the room should be able to help you.

## Get in Touch

We appreciate constructive feedback from people who use CouchDB, so don't be shy. We know there are bugs and we know 
there is room for improvement.

ʕ´•ᴥ•`ʔ Thanks!

-- Fauxton team


[6]: http://couchdb.apache.org/conduct.html
[7]: http://couchdb.apache.org/bylaws.html
[8]: http://webchat.freenode.net?channels=%23couchdb-dev
[9]: https://github.com/apache/couchdb/blob/master/CONTRIBUTING.md
