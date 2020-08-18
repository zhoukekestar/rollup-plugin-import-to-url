# rollup-plugin-import-to-url

Deeply inspired by `rollup-plugin-esm-import-to-url`.


# Options

* domain: ESM loader server
  * default: jspm.dev
  * for Alibaba: jspm.alibaba-inc.com
* npmregistry: Check dependencies' default version
  * default: registry.npmjs.com
  * for Alibaba: registry.npm.alibaba-inc.com
* dependencies: custom dependencies map
  * default: {}. For example: { qs: '^1.0.0' }
