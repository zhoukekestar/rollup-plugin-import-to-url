'use strict';
const path = require('path');

const notBare = (str) =>
  str.startsWith('/') || str.startsWith('./') || str.startsWith('../');

function getImportVersion(name) {
  const pkg = require(path.resolve(
    __dirname,
    process.env.PWD,
    './package.json'
  ));

  if (pkg && pkg.dependencies && pkg.dependencies[name]) {
    return pkg.dependencies[name];
  }

  if (pkg && pkg.peerDependencies && pkg.peerDependencies[name]) {
    return pkg.peerDependencies[name];
  }

  if (pkg && pkg.devDependencies && pkg.devDependencies[name]) {
    return pkg.devDependencies[name];
  }

  return process.env[`npm_package_dependencies_${name.replace(/-/g, '_')}`];
}

function simplifyVersion(version) {
  if (/^\^/.test(version)) {
    return version.match(/^\^(\d+)/)[1];
  }

  return version;
}

function importToUrl({ domain = 'jspm.dev' } = {}) {
  return {
    name: 'rollup-plugin-import-to-url',
    resolveId(importee) {
      if (!/^http/.test(importee) && !notBare(importee)) {
        return {
          id: `https://${domain}/${importee}@${simplifyVersion(
            getImportVersion(importee)
          )}`,
          external: true,
        };
      }

      return null;
    },
  };
}

module.exports = importToUrl;
