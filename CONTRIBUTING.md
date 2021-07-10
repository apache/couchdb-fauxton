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

The [Readme file](https://github.com/apache/couchdb-fauxton/blob/main/readme.md) has information about how to get the project set up for development.

## Guide to Contributions

We follow our coding-styleguide to make it easier for everyone to write, read and review code:
[https://github.com/apache/couchdb-fauxton/blob/main/styleguide.md](https://github.com/apache/couchdb-fauxton/blob/main/styleguide.md)

To start working on a specific ticket, create a branch with the GitHub Issue # followed by a traincase description of the issue.

> e.g. 1234-Added-support-for-list-functions

If there is no GH Issue for the issue you have, you don't have to create one. Please describe the issue, how it happens and how you fixed it in the commit message.

Commit messages should follow the following style:

```
A brief one line description < 72 chars

Followed by further explanation if needed, this should be wrapped at
around 72 characters. Most commits should reference an existing
issue

Fixes #XXX (if there is a GH Issue)
Fixes apache/couchdb#XXX (if there is a CouchDB project GH Issue)
```

Before you submit the Pull Request, please [run our test suite](#tests.md) and make sure that it passes.

We regularly check the PR list for Fauxton and should get back
to you with a code review. If no one has responded to you yet, you can find us on [Freenode IRC in #couchdb-dev][8].
Ping **garren**, **robertkowalski** or **michellep** though anyone in the room should be able to help you.

## Get in Touch

We appreciate constructive feedback from people who use CouchDB, so don't be shy. We know there are bugs and we know
there is room for improvement.

ʕ´•ᴥ•`ʔ Thanks!

-- Fauxton team

[6]: http://couchdb.apache.org/conduct.html
[7]: http://couchdb.apache.org/bylaws.html
[8]: http://webchat.freenode.net?channels=%23couchdb-dev
[9]: https://github.com/apache/couchdb/blob/main/CONTRIBUTING.md
