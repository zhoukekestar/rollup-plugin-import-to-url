'use strict';

const notBare = str =>
  str.startsWith('/') || str.startsWith('./') || str.startsWith('../');

function getImportVersion(name) {
  return process.env[`npm_package_dependencies_${name.replace(/-/g, '_')}`];
}

function simplifyVersion(version) {
  if (/^\^/.test(version)) {
    return version.match(/^\^(\d)+/)[1]
  }

  return version;
}

function importToUrl({ domains = 'jspm.dev' } = {}) {
  return {
    name: 'rollup-plugin-import-to-url',
    resolveId(importee) {
      if (!notBare(importee)) {
        return {
          id: `https://${
            domain
          }/${
            importee
          }@${
            simplifyVersion(getImportVersion(importee))
          }`,
          external: true,
        };
      }

      return null;
    },
  };
}

export default importToUrl;
