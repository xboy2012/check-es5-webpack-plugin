const acorn = require('acorn');
const colors = require('colors/safe');

const PLUGIN_NAME = 'CheckES5WebpackPlugin';

const tapCompilerEmitHook = (compiler, fn) => {
  if (compiler.hooks) {
    compiler.hooks.emit.tapPromise(PLUGIN_NAME, async compilation => fn(compilation));
  } else {
    compiler.plugin('emit', async (compilation, callback) => {
      try {
        await fn(compilation)
        callback(null)
      } catch (e) {
        callback(e)
      }
    });
  }
}

const log = (msg) => {
  console.log(`[${PLUGIN_NAME}]${msg}`);
}

const check = (source) => {
  const code = source.source();
  try {
    acorn.parse(code, {
      ecmaVersion: 5
    });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = class CheckES5WebpackPlugin {
  apply(compiler) {
    tapCompilerEmitHook(compiler, async compilation => {
      const assets = compilation.assets;
      const assetsFiles = Object.keys(assets).filter(fileName => fileName.endsWith('.js'));
      const errorJsFiles = assetsFiles.filter(fileName => !check(assets[fileName]));

      if (!errorJsFiles.length) {
        log(colors.green(`All js files are ES5 compatible.`));
        return;
      }

      for (let fileName of errorJsFiles) {
        log(colors.red(` \`${fileName}\` is not ES5 compatible.`));
      }
      throw Error('Some js files are not ES5 compatible.');
    })
  }
};
