import test from 'ava';
import git from 'nodegit';

import tempRepo from './helpers/index';

import range from '../';

const tmp = tempRepo();

test.before(async () => {
  await tmp.init();
  await tmp.commit('chore: chore1');
  await tmp.commit('chore: chore2');
  await tmp.run('checkout', '-b', 'dev');
  await tmp.commit('chore: chore4');
  await tmp.run('checkout', 'master');
  await tmp.commit('chore: chore3');
  await tmp.run('tag', '-m', 'an annotated commit', 'stable');
  await tmp.run('merge', '-m', 'merge dev', 'dev');
});

test('should parse basic three dot range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);
  const [expected, actual] = await Promise.all([
    tmp.parseAll('stable^{commit}...dev'),
    range.parse(repo, 'stable...dev')
  ]);

  t.deepEqual(actual, expected);
});

test('should parse two dot range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);
  const [expected, actual] = await Promise.all([
    tmp.parseAll('HEAD~2..HEAD'),
    range.parse(repo, 'HEAD~2..HEAD')
  ]);

  t.deepEqual(actual, expected);
});

test('should parse parents range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);
  const [expected, actual] = await Promise.all([
    tmp.parseAll('HEAD^@'),
    range.parse(repo, 'HEAD^@')
  ]);

  t.deepEqual(actual, expected);
});

test('should parse excluding parent range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);
  const [expected, actual] = await Promise.all([
    tmp.parseAll('HEAD^-2'),
    range.parse(repo, 'HEAD^-2')
  ]);

  t.deepEqual(actual, expected);
});

test('should parse single commit range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);
  const [expected, actual] = await Promise.all([
    tmp.parseAll('HEAD^!'),
    range.parse(repo, 'HEAD^!')
  ]);

  t.deepEqual(actual, expected);
});

test('should parse revision range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);
  const [expected, actual] = await Promise.all([
    tmp.parseAll('HEAD', '^stable^{commit}'),
    range.parse(repo, ['HEAD', '^stable'])
  ]);

  t.deepEqual(actual, expected);
});

test('should get the commits in a range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);

  const expected = [
    'merge dev',
    'chore: chore4',
    'chore: chore3',
    'chore: chore2'
  ];
  const actual = await range.parse(repo, ['HEAD~3...HEAD'])
    .then(revisions => revisions.commits())
    .then(commits => commits.map(c => c.message().trim()));

  t.deepEqual(actual, expected);
});

test('should get limited number of commits in a range', async t => {
  const repo = await git.Repository.open(tmp.gitDir);
  const expected = [
    'merge dev',
    'chore: chore4',
    'chore: chore3'
  ];
  const actual = await range.parse(repo, 'HEAD')
    .then(revisions => revisions.commits({limit: 3}))
    .then(commits => commits.map(c => c.message().trim()));

  t.deepEqual(actual, expected);
});

test('should get the commits in a range sorted', async t => {
  const repo = await git.Repository.open(tmp.gitDir);

  const expected = [
    'chore: chore2',
    'chore: chore3',
    'chore: chore4',
    'merge dev'
  ];
  const actual = await range.parse(repo, ['HEAD~3...HEAD'])
    .then(revisions => revisions.commits({
      sorting: [
        git.Revwalk.SORT.TOPOLOGICAL,
        git.Revwalk.SORT.REVERSE
      ]
    }))
    .then(commits => commits.map(c => c.message().trim()));

  t.deepEqual(actual, expected);
});

test('should reject if the revision is empty', async t => {
  const repo = await git.Repository.open(tmp.gitDir);

  await t.throws(range.parse(repo)
    .then(revisions => revisions.commits())
  );
});
