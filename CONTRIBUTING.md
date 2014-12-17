Contributing to Fauxton
=======================

CouchDB is an Apache project, which is why we keep all our issues in Jira.  You can find or submit issues for Fauxton [here](https://issues.apache.org/jira/issues/?jql=project%20%3D%20COUCHDB%20AND%20resolution%20%3D%20Unresolved%20AND%20component%20%3D%20Fauxton%20ORDER%20BY%20priority%20DESC).

We try to keep all tickets up to date with Skill level for you to have an idea of the level of effort or comfortability with the framework you'd need to complete the task.

The [Readme file](https://github.com/apache/couchdb-fauxton/blob/master/readme.md) has information about how to get the project running.

##Guide to Contributions
We follow our coding-styleguide to make it easier for everyone to write, read and review code: [https://github.com/apache/couchdb-fauxton/blob/master/styleguide.md](https://github.com/apache/couchdb-fauxton/blob/master/styleguide.md)

To start working on a specific ticket, create a branch with the Jira ID # followed by a traincase description of the issue.

> e.g.   1234-Added-support-for-list-functions

If there is no Jira ticket for the issue you have, you don't have to create one.

Please describe the issue, how it happens and how you fixed it in the commit message. Before you submit the Pull-Request, please run our testsuite and make sure that it passes:

```
grunt test
```

You can also open `couchdb-fauxton/test/runner.html` in a browser. Click on the headlines of the testcases to just run a specific test that fails - it should be faster than running the whole testsuite every time.

Commit messages should follow the following style:

```
A brief one line description < 72 chars

Followed by further explanation if needed, this should be wrapped at
around 72 characters. Most commits should reference an existing
issue

Closes COUCHDB-XXXX (if there is a Jira ticket)
```

When you're ready for a review, submit a Pull Request. We regularly check the PR list for Fauxton and should get back to you with a code review.  If no one has responded to you yet, you can find us on IRC in #couchdb-dev.  Ping **Garren**, **robertkowalski** or **Deathbear**, though anyone in the room should be able to help you.

## Get in Touch
We appreciate constructive feedback from people who use CouchDB, so don't be shy. We know there are bugs and we know there is room for improvement.

ʕ´•ᴥ•`ʔ Thanks!

-- Fauxton team

PS - If you are new to contributing to open source, or using GitHub reach out to us on irc (#couchdb-dev)! We will happily help you.
