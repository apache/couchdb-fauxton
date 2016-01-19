var semver = require('semver');

var version = process.version.replace(/^v/, '');

if (!semver.satisfies(version, '>=4')) {
  console.error('Error:');
  console.error('Fauxton needs Node 4 or greater to work');
  process.exit(1);
}
