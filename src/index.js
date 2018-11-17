const acorn = require('acorn')
const colors = require('colors')

const check = (fileName, source) => {
  const code = source.source()
  try {
    acorn.parse(code, {
      ecmaVersion: 5
    });
    return true;
  } catch (e) {
    console.log(colors.error(`File ${fileName} is not ES5 compatible`));
    throw Error(`File ${fileName} is not ES5 compatible`);
  }
}


module.exports = class CheckES5WebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapPromise("CheckES5WebpackPlugin", async compilation => {
      const assets = compilation.assets;
      const assetsFiles = Object.keys(assets).filter(fileName => fileName.endsWith('.js'));

      for(let assetFile of assetsFiles) {
        check(assetFile, assets[assetFile])
      }
    });
  }
};
