'use strict';
const path = require('path');
const fetch = require('node-fetch');

const notBare = str =>
  str.startsWith('/') || str.startsWith('./') || str.startsWith('../');

/**
 * Get package's version by name.
 */
async function getImportVersion(name, npmregistry) {
  // Get version by current project's package.json
  const pkg = require(path.resolve(
    __dirname,
    process.env.PKG_PWD || process.env.PWD,
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

  // Get version by process env
  const envVersion =
    process.env[`npm_package_dependencies_${name.replace(/-/g, '_')}`];
  if (envVersion) {
    return envVersion;
  }

  const remoteInfo = await fetch(`https://${npmregistry}/${name}`).then(d =>
    d.json()
  );

  // 需要返回 ^x.x.x，否则会被 simplifyVersion 解析为固定版本
  return `^${remoteInfo['dist-tags'].latest}`;
}

/**
 * Get major version
 */
function simplifyVersion(version) {
  // TODO: 看看有没有更好的处理方式
  // 目前是先直接暴力去掉所有的非 major 版本号
  if (/^\^/.test(version)) {
    return version.match(/^\^(\d+)/)[1];
  }

  if (/^~/.test(version)) {
    return version.match(/^~(\d+)/)[1];
  }

  if (/^>=/.test(version)) {
    return version.match(/^>=(\d+)/)[1];
  }

  return version;
}

function importToUrl({
  domain = 'jspm.dev',
  npmregistry = 'registry.npmjs.com',
  dependencies = {},
} = {}) {
  return {
    name: 'rollup-plugin-import-to-url',
    async resolveId(importee) {
      if (/^http(s?):\/\//i.test(importee)) return null;

      if (!notBare(importee)) {
        try {
          const version = await getImportVersion(importee, npmregistry);
          return {
            id: `https://${domain}/${importee}@${simplifyVersion(
              dependencies[importee] || version
            )}`,
            external: true,
          };
        } catch (err) {
          console.error(`[ERROR] resolve ${importee} error`);
        }
      }

      return null;
    },
  };
}

module.exports = importToUrl;
