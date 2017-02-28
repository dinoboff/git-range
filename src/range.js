'use strict';

const git = require('nodegit');

class Range extends Array {

  constructor(repo, revisions = []) {
    super(...revisions);
    this.repo = repo;
  }

  walker() {
    if (this.length < 1) {
      throw new Error('no revision to walk');
    }

    return this.reduce((walker, rev) => {
      if (rev.startsWith('^')) {
        walker.hide(git.Oid.fromString(rev.slice(1)));
      } else {
        walker.push(git.Oid.fromString(rev));
      }

      return walker;
    }, git.Revwalk.create(this.repo));
  }

  commits({limit = Infinity, sorting = [git.Revwalk.SORT.TOPOLOGICAL]} = {}) {
    return new Promise(resolve => {
      const walker = this.walker();

      walker.sorting(...[].concat(sorting));

      resolve(walker);
    }).then(walker => walker.getCommits(limit).then(commits => {
      walker.free();

      return commits;
    }));
  }

}

exports.create = (repo, revisions) => new Range(repo, revisions);
