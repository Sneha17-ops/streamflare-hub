const { execSync } = require('child_process');

try {
  const out = execSync('git diff --name-only --cached', { encoding: 'utf8' });
  const files = out.split(/\r?\n/).filter(Boolean);
  const forbidden = files.filter((f) => /(^|\/)\.env($|\.|\/)|^\.env/.test(f) || /\.envlocal$/i.test(f) || /\.env\.local$/i.test(f));
  if (forbidden.length) {
    console.error('Error: You are attempting to commit environment files which may contain secrets:');
    forbidden.forEach((f) => console.error('  -', f));
    console.error('\nCommit aborted. Remove these files from the commit (git restore --staged <file>) and store secrets securely.');
    process.exit(1);
  }
  process.exit(0);
} catch (err) {
  console.error('Failed to verify staged files:', err.message || err);
  process.exit(2);
}
