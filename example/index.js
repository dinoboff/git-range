#!/usr/bin/env node --harmony_async_await

'use strict';

const git = require('nodegit');
const range = require('../');

git.Repository.open('.git').then(
  repo => range.parse(repo, ['HEAD^@', '^v1.0.0']).then(revisions => {
    // Equivalent output to "git rev-parse HEAD^@ ^v1.0.0"
    console.log(revisions.join('\n'));

    return revisions.getCommits();
  }).then(
    // Equivalent output to "git log --oneline HEAD^@ ^v1.0.0"
    commits => console.log(commits.map(c => c.summary()).join('\n'))
  ).then(
    () => repo.free(),
    e => {
      repo.free();
      console.error(e);
    }
  )
);
