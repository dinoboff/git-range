# git-range

[![Build Status][ci-badge]][travis]
[![Coverage][codecov-badge]][codecov]
[![bitHound Overall Score][bithound-badge]][bithound]

Parse git revision range for [nodegit].

Supports the following format:

- "&lt;rev1>..&lt;rev2>";
- "&lt;rev2> ^&lt;rev1>";
- "&lt;rev1>...&lt;rev2>";
- "&lt;rev>^@";
- "&lt;rev>^!";
- "&lt;rev>^-&lt;nth parent>";


## Usage

[nodegit.Revparse] can parse single revision reference and [nodegit.Revwalk] only support two dot notation (via `pushRange(range)` or single revision. Even with single revison you need to know what its type (a commit sha, its shortname, a reference).

To parse a revision range and logs commits in the range:
```
const git = require('nodegit');
const range = require('git-range');

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

```


## API

TODO.


## License

MIT License

Copyright (c) 2017 Damien Lebrun


[nodegit]: http://www.nodegit.org/
[nodegit.Revparse]: http://www.nodegit.org/api/revparse/#single
[nodegit.Revwalk]: http://www.nodegit.org/api/revwalk/#pushRange

[travis]: https://travis-ci.org/dinoboff/git-range
[ci-badge]: https://travis-ci.org/dinoboff/git-range.svg?branch=master
[bithound]: https://www.bithound.io/github/dinoboff/git-range
[bithound-badge]: https://www.bithound.io/github/dinoboff/git-range/badges/score.svg
[codecov]: https://codecov.io/gh/dinoboff/git-range
[codecov-badge]: https://codecov.io/gh/dinoboff/git-range/branch/master/graph/badge.svg
