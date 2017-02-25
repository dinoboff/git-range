import path from 'path';

import shell from 'shelljs';
import tempfile from 'tempfile';
import childProcess from 'child-process-promise';

export default function tempRepo() {
  const repo = tempfile();
  const gitDir = path.join(repo, '.git');

  return {

    get root() {
      return repo;
    },

    get gitDir() {
      return gitDir;
    },

    async run(...cmd) {
      const ps = childProcess.spawn('git', ['--git-dir', gitDir, ...cmd], {
        capture: ['stdout', 'stderr']
      });

      return ps.then(result => result.stdout.trim())
        .catch(err => Promise.reject(new Error(`Failed to run "git ${cmd.join(' ')}": ${err.stderr}`)));
    },

    async init(name = 'Alice Smith', email = 'alice@example.com') {
      shell.mkdir('-p', repo);
      await this.run('init', repo);
      await this.run('config', 'user.name', name);
      await this.run('config', 'user.email', email);
    },

    async commit(subject, {lines = [], author = 'Bob Smith <bob@example.com>', date = new Date('2017-01-01')} = {}) {
      const msg = [subject].concat('', lines).join('\n').trim();

      await this.run('commit', '--allow-empty', `--author=${author}`, '--date', date, `--message=${msg}`);
    },

    async parse(rev) {
      return this.run('rev-parse', '--verify', rev);
    },

    async parseAll(...rev) {
      return this.run('rev-parse', ...rev)
        .then(result => result.split('\n'));
    },

    remove() {
      shell.rm('-rf', repo);
    }

  };
}
