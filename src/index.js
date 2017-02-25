'use strict';

const flatten = require('lodash.flatten');
const git = require('nodegit');

const range = require('./range');

exports.parse = function (repo, revisions = []) {
  return parseRange(repo, [].concat(revisions))
    .then(range.create.bind(null, repo));
};

function parseRange(repo, revisions) {
  return Promise.all(revisions.map(revision => {
    if (revision.includes('...')) {
      return threeDotRange(repo, revision);
    }

    if (revision.includes('..')) {
      return twoDotRange(repo, revision);
    }

    if (revision.endsWith('^@')) {
      return parentsRange(repo, revision);
    }

    if (revision.endsWith('^!')) {
      return commitRange(repo, revision);
    }

    const matchSkipNthParentRange = revision.match(/^(.+)\^-(\d*)$/);

    if (matchSkipNthParentRange != null) {
      const [rev, nth] = matchSkipNthParentRange.slice(1);

      return Promise.all([
        includeRange(repo, rev),
        excludeRange(repo, `${rev}^${nth}`)
      ]);
    }

    if (revision.startsWith('^')) {
      return excludeRange(repo, revision.slice(1));
    }

    return includeRange(repo, revision);
  })).then(flatten);
}

function threeDotRange(repo, revision) {
  const [left, right] = revision.split('...');

  return Promise.all([
    parse(repo, right),
    parse(repo, left)
  ]).then(branches => git.Merge.base(repo, ...branches).then(base => {
    const included = branches.map(oid => oid.toString());
    const excluded = base == null || base.iszero() ? [] : [`^${base}`];

    return [
      ...included,
      ...excluded
    ];
  }));
}

function twoDotRange(repo, revision) {
  const [left, right] = revision.split('..');

  return Promise.all([
    parse(repo, left),
    parse(repo, right)
  ]).then(([rOid, lOid]) => [lOid.toString(), `^${rOid}`]);
}

function parentsRange(repo, revision) {
  const rev = revision.slice(0, -2);

  return parse(repo, rev)
    .then(oid => repo.getCommit(oid))
    .then(commit => commit.parents().map(oid => oid.toString()));
}

function commitRange(repo, revision) {
  const rev = revision.slice(0, -2);

  return parse(repo, rev)
    .then(oid => repo.getCommit(oid))
    .then(commit => [
      commit.sha(),
      ...commit.parents().map(oid => `^${oid}`)
    ]);
}

function includeRange(repo, revision) {
  return parse(repo, revision).then(oid => oid.toString());
}

function excludeRange(repo, revision) {
  return parse(repo, revision).then(oid => `^${oid}`);
}

function parse(repo, revision) {
  return git.Revparse.single(repo, revision).then(peel);
}

function peel(obj) {
  let result;

  switch (obj.type()) {

  case 1:
    result = Promise.resolve(obj.id());
    break;

  case 4:
    result = obj.peel(1).then(peel);
    break;

  /* istanbul ignore next */
  default:
    throw Promise.reject(new Error('Unsuported type'));

  }

  obj.free();

  return result;
}
