# CheckES5WebpackPlugin

## Introduction

Although most modern browsers supports some ES6 javascript runtime, it's still necessary to support those "old" browsers who DO NO SUPPORT THESE NEW FEATURES.

We are always using `babel-loader` to transform ES6 code to ES5 in order to make the output bundle js file `ES5 compatible`

It's recommended to skip babel for files from `node_modules` in order to make webpack compile faster.

However, more and more npm packages provide ES6 format source from `module` field from `package.json`. Meanwhile, some old webpack with old versions or with outdated `webpack.config`, we may by accident leave some ES6 source code from `node_modules` untransformed by `babel-loader`. Then output js may contain some ES6 code.

In other words, `THE OUTPUT BUNDLE JS MIGHT NOT BE ES5 COMPATIBLE, WHICH MAY POTTENTIALLY BREAK ON SOME BROWSERS`.

## What does `CheckES5WebpackPlugin` do?

With `CheckES5WebpackPlugin`, every time before webpack emit js files, the plugin first detect `whether the output js is ES5 compatible`. If not, obvious error logs for each problematic js will be shown in the console and the compilation process will stop immediately, which will notify you something is wrong and need to be fixed.

With `CheckES5WebpackPlugin`, you can avoid accidentally releasing js files that are not ES5 compatible.

## How it works?

Thanks to `acorn`'s ability to parse javascript code with strict limitations, we can simulate an ES5 only parser to parse javascript. In this way, ES6 or modern javascript codes will fail to be parsed, then we know something went wrong.

## Install

First Install the package in shell,

```
npm i check-es5-webpack-plugin -D
```


## Usage

In your webpack config,

add the plugin as followed

```javascript
const CheckES5WebpackPlugin = require('check-es5-webpack-plugin')


{
	//... other webpack configs

	plugins: [
		//... other webpack plugins

		new CheckES5WebpackPlugin()
	]
}
```

> NOTE: You'd better make sure NO PLUGINS COME AFTER IT in your configuration, otherwise you may miss validation for further changes from other plugins.

## Options

Now there is no options for this plugin. In future versions, more custom configs may be provided. Thanks
