#!/usr/bin/env node --harmony_async_await

'use strict';

const git = require('nodegit');
const range = require('../');

git.Repository.discover('.', 0, '')
  .then(gitDir => git.Repository.open(gitDir))
  .then(repo => range.parse(repo, ['HEAD^@', '^v0.1.0']).then(revisions => {
    // Equivalent output to "git rev-parse HEAD^@ ^v0.1.0^commit"
    console.log('Range:');
    console.log(revisions.join('\n'));

    return revisions.commits();
  }).then(commits => {
    // Equivalent output to "git log --oneline HEAD^@ ^v1.0.0"
    console.log('Commits:');
    commits.forEach(c => console.log(`${c.sha().slice(0, 7)} ${c.summary()}`));
  }).then(
    () => repo.free(),
    e => {
      repo.free();
      return Promise.reject(e);
    }
  )).done();
