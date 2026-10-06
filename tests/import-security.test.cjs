const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

test('article importer rejects hostile sitemap paths and redirects offline', () => {
  const result = spawnSync(process.platform === 'win32' ? 'python' : 'python3',
    [path.join(__dirname, 'import_security.py')], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
      encoding: 'utf8', windowsHide: true, timeout: 15000,
    });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
