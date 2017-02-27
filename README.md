# git-range

[![Build Status][ci-badge]][travis]
[![Coverage][codecov-badge]][codecov]
[![bitHound Overall Score][bithound-badge]][bithound]

Parse git revision ranges for [nodegit].

Supports the following format:

- `<rev1>..<rev2>`.
- `<rev2> ^<rev1>`.
- `<rev1>...<rev2>`.
- `<rev>^@`.
- `<rev>^!`.
- `<rev>^-<nth parent>`.


## Usage

[nodegit.Revparse] can parse single revision references and [nodegit.Revwalk] only support two dot notation ranges (via `pushRange(range)` or single revisions. Even with single revisons, you need to know what its type (a commit sha, its shortname, a reference).

With git-range, you can instead convert a range to a list of commit id; the revisions to exclude starts with "^":
```js
const git = require('nodegit');
const range = require('git-range');

git.Repository.open('.git').then(
  repo => range.parse(repo, ['HEAD^@', '^v1.0.0']).then(revisions => {
    // Equivalent output to "git rev-parse HEAD^@ ^v1.0.0^{commit}"
    console.log(revisions.join('\n'));
    repo.free();
  }).catch(e => {
    repo.free();
    console.error(e);
  })
);
```


## API

- `gitRange.parse(repo: nodegit.Repository, revisions: string|string[]): Promise<Range,Error>`:

  Parse a git revision range to a list of revision id to include or exclude (starts with "^").

- `Range: string[]`

  List of revision id to include or exclude (starts with "^").

- `Range.prototype.walker(): nodegit.Revwalk`:

  Create a Revwalk from the revision range.

- `Range.prototype.commits({limit: number, sorting: number|number[]}): Promise<nodegit.Commit[],Error>`:

  Resolve to the commits in the range.


## Known Issues

Do not support triple dot range notation if there's more than one merge-bases between the two revisions.


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
