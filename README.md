# Webpack Template for TSX & VueJs

This is a Webpack Template for generating Web Pages with [TSX](http://www.typescriptlang.org/) and [VueJs](https://vuejs.org).
This readme explains how to build this Template from scratch, or how to extend an existing webpack project.

*Please note:*
The simpler Template without TSX support is available at  [tamino-martinius/template-webpack-typescript-vue](https://github.com/tamino-martinius/template-webpack-typescript-vue).

## TOC
- [Webpack Template for TSX & VueJs](#webpack-template-for-tsx--vuejs)
  - [TOC](#toc)
  - [Initialize your project](#initialize-your-project)
  - [Initialize the project](#initialize-the-project)
  - [Install our dependencies](#install-our-dependencies)
  - [Add a TypeScript configuration file](#add-a-typescript-configuration-file)
  - [Adding Webpack](#adding-webpack)
  - [Add a build script](#add-a-build-script)
  - [Create a basic project](#create-a-basic-project)
  - [Adding a component](#adding-a-component)
  - [Single File Components](#single-file-components)
  - [Style loaders](#style-loaders)
  - [Using decorators to define a component](#using-decorators-to-define-a-component)
  - [React like templates with TSX](#react-like-templates-with-tsx)
  - [HtmlWebpackPlugin](#htmlwebpackplugin)
  - [Local Dev Server](#local-dev-server)
  - [What next](#what-next)
  - [Contributions](#contributions)

## Initialize your project

Let's create a new package.

```sh
mkdir webpack-typescript-vue
cd webpack-typescript-vue
```

Next, we'll scaffold our project in the following way:

```txt
webpack-typescript-vue/
├─ dist/
├─ public/
└─ src/
   └─ components/
```

TypeScript files will start out in your `src` folder, run through the TypeScript compiler, then webpack, and end up in a `index.js` file in `dist`.
Any components that we write will go in the `src/components` folder.

Everything within the public folder will be copied to dist on build. The public folder may contain your fav icon or some other static assets.

Let's scaffold this out:

```shell
mkdir -p src/components
mkdir public
```

Webpack will eventually generate the `dist` directory for us.

## Initialize the project

Now we'll turn this folder into an npm package.

```shell
npm init
```

You'll be given a series of prompts.
You can use the defaults except for your entry point.
You can always go back and change these in the `package.json` file that's been generated for you.

## Install our dependencies

Ensure TypeScript, Webpack, Vue and the necessary loaders are installed.
Additionally its recommended to also install tslint to improve your code quality.

```shell
npm install --save-dev \
  copy-webpack-plugin \
  css-loader \
  file-loader \
  ts-loader \
  tslint \
  tslint-config-airbnb \
  typescript \
  vue-loader \
  vue-template-compiler \
  webpack \
  webpack-cli
```

Webpack is a tool that will bundle your code and optionally all of its dependencies into a single `.js` file. While you don't need to use a bundler like Webpack or Browserify, these tools will allow us to use `.vue` files which we'll cover in a bit.

We didn't need to [add `.d.ts` files](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html), but if we were using a package which didn't ship declaration files, we'd need to install the appropriate `@types/` package.
[Read more about using definition files in our documentation](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html).

You will also need some dependencies which need to be bundled with your code. This is vue
and some suggested extensions.

```shell
npm install --save \
  vue \
  vue-class-component \
  vue-property-decorator \
  vue-router
```

## Add a TypeScript configuration file

You'll want to bring your TypeScript files together - both the code you'll be writing as well as any necessary declaration files.

To do this, you'll need to create a `tsconfig.json` which contains a list of your input files as well as all your compilation settings. Simply create a new file in your project root named `tsconfig.json` and fill it with the following contents:

```json
{
  "compilerOptions": {
    "outDir": "./built/",
    "sourceMap": true,
    "strict": true,
    "module": "es2015",
    "moduleResolution": "node",
    "target": "es5",
    "experimentalDecorators": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "exclude": [
    "node_modules"
  ],
  "include": [
    "./src/**/*.ts",
    "./src/**/*.tsx"
  ]
}

```

Notice the `strict` flag is set to true.
At the very least, TypeScript's `noImplicitThis` flag will need to be turned on to leverage Vue's declaration files, but `strict` gives us that and more (like `noImplicitAny` and `strictNullChecks`).
We strongly recommend using TypeScript's stricter options for a better experience.

## Adding Webpack

We'll need to add a `webpack.config.js` to bundle our app.

```js
const path = require('path');
const webpack = require('webpack');
const vueLoaderPlugin = require('vue-loader/lib/plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
  },
  performance: {
    hints: false,
  },
  devtool: '#eval-source-map',
  plugins: [
    new vueLoaderPlugin(),
    new copyWebpackPlugin([{
      from: 'public',
      to: '',
    }]),
  ],
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
    new uglifyJsPlugin({
      uglifyOptions: {
        sourceMap: true,
        compress: {
          warnings: false,
        },
      },
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ]);
}
```

## Add a build script

Open up your `package.json` and add a script named `build` to run Webpack.
Your `"scripts"` field should look something like this:

```json
  "scripts": {
    "build": "rm -rf dist && webpack",
    "build:production": "npm run build --production",
    "watch": "npm run build -- --watch"
  },
```

Once we add an entry point, we'll be able to build by running

```sh
npm run build
```

If you want to build the minified release version

```sh
npm run build --production
# or
npm run build:production
```

and have builds get triggered on changes by running

```sh
npm run build -- --watch
# or
npm run watch
```

## Create a basic project

Let's create the most bare-bones Vue & TypeScript example that we can try out.
First, create the file `./src/index.ts`:

```ts
// src/index.ts

import vue from 'vue';

let v = new vue({
  el: '#app',
  template: `
    <div>
      <div>Hello {{name}}!</div>
      Name: <input v-model="name" type="text">
    </div>
  `,
  data: {
    name: 'World'
  },
});
```

Let's check to see if everything is wired up correctly.
Create an `index.html` with the following content at your root:

```html
<!doctype html>
<html>
<head>
  <title>Webpack Template for TypeScript & VueJs</title>
</head>
<body>
  <div id="app"></div>
  <script src="./index.js"></script>
</body>
</html>
```

Now run `npm run build` and open up your `index.html` file in a browser.

You should see some text that says `Hello World!`.
Below that, you'll see a textbox.
If you change the content of the textbox, you'll notice how the text is synchronized between the two.

Congrats!
You've gotten TypeScript and Vue fully hooked up!

## Adding a component

As you've just seen, Vue has a very simple interface for when you need to accomplish simple tasks.
When our page only needed to communicate a bit of data between two elements, it took very little code.

For more complex tasks, Vue is flexible in that it supports breaking your application into *components*.
[Components](https://vuejs.org/v2/guide/components.html) are useful for separating the concerns of how entities are displayed to the user.
[Read up more on components from Vue's documentation.](https://vuejs.org/v2/guide/components.html)

A Vue component can be declared in the following manner:

```ts
// src/components/Hello.ts

import vue from 'vue';

export default vue.extend({
  template: `
    <div>
      <div>Hello {{name}}{{exclamationMarks}}</div>
      <button @click="decrement">-</button>
      <button @click="increment">+</button>
    </div>
  `,
  props: ['name', 'initialEnthusiasm'],
  data() {
    return {
      enthusiasm: this.initialEnthusiasm,
    };
  },
  methods: {
    increment() { this.enthusiasm += 1; },
    decrement() {
      if (this.enthusiasm > 1) {
        this.enthusiasm -= 1;
      }
    },
  },
  computed: {
    exclamationMarks(): string {
      return Array(this.enthusiasm + 1).join('!');
    },
  },
});
```

This component has two buttons and some text.
When rendered, it takes an initial `name` and an `initialEnthusiasm` which is the number of exclamation marks we want to display.
When we hit the `+` button, it adds an exclamation mark to the end of the text.
Likewise, when we hit the `-` button, it removes an exclamation mark unless we're down to just one.

Our root Vue instance can consume it as follows:

```ts
// src/index.ts

import vue from 'vue';
import Hello from './components/Hello';

let v = new vue({
    el: '#app',
    template: `
      <div>
        Name: <input v-model="name" type="text">
        <hello :name="name" :initialEnthusiasm="5" />
      </div>
    `,
    data: { name: 'World' },
    components: {
        Hello
    }
});
```

However, we'll note that it is fairly popular to use [Vue's *single file components*](https://vuejs.org/v2/guide/single-file-components.html).
Let's try writing the above as an SFC.

## Single File Components

When using Webpack or Browserify, Vue has plugins like [vue-loader](https://github.com/vuejs/vue-loader) and [vueify](https://www.npmjs.com/package/vueify) which allow you to author your components in HTML-like files.
These files, which end in a `.vue` extension, are single file components.

There are a few things that need to be put in place to use `.vue` files with TypeScript, but luckily we're already halfway there.
We already installed vue-loader earlier when we got our dev dependencies.
We also specified the `appendTsSuffixTo: [/\.vue$/],` option to ts-loader in our `webpack.config.js` file, which allows TypeScript to process the code extracted from a single file component.

One extra thing we'll have to do is tell TypeScript what `.vue` files will look like when they're imported.
We'll do this with a `vue-shims.d.ts` file:

```ts
// src/vue.d.ts

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
```

We don't need to import this file anywhere.
It's automatically included by TypeScript, and it tells it that anything imported that ends in `.vue` has the same shape of the Vue constructor itself.

What's left?
The editing experience!
One of the best features TypeScript gives us is its editor support.
To leverage that within `.vue` files, we recommend using [Visual Studio Code](https://code.visualstudio.com/) with the [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) plugin for Vue.

Now, let's write an SFC!

```html
<!-- src/components/Hello.vue -->

<template>
  <div>
    <div class="greeting">Hello {{name}}{{exclamationMarks}}</div>
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
  </div>
</template>

<script lang="ts">
import vue from 'vue';

export default vue.extend({
  props: ['name', 'initialEnthusiasm'],
  data() {
    return {
      enthusiasm: this.initialEnthusiasm,
    };
  },
  methods: {
    increment() {
      this.enthusiasm += 1;
    },
    decrement() {
      if (this.enthusiasm > 1) {
        this.enthusiasm -= 1;
      }
    },
  },
  computed: {
    exclamationMarks(): string {
      return Array(this.enthusiasm + 1).join('!');
    },
  },
});
</script>
```

and let's import it for our root instance:

```ts
// src/index.ts

import vue from 'vue';
import HelloVue from './components/Hello.vue';

let v = new vue({
  el: '#app',
  template: `
    <div>
      Name: <input v-model="name" type="text">
      <hello-vue :name="name" :initialEnthusiasm="5" />
    </div>
  `,
  data: { name: 'World' },
  components: {
    HelloVue,
  },
});
```

Notice a few things about our single-file component:

* We had to write `<script lang="ts">` to get it working with TypeScript.
* We had to import the component with the `.vue` extension in `index.ts`.
* We were able to write CSS isolated to our components in a `<style>` tag, which we couldn't do in our `.ts` components.
* We default-exported a call to `Vue.extend` (rather than the options bag itself).
  If you don't write `Vue.extend`, Vetur will make it look like things are working correctly, but you'll get an error when you build your project.

Try running `npm run build` and open up `index.html` to see the result!

## Style loaders

To use style within the vue templates its needed to add the `vue-style-loader` to each of the style loader configs.

```js
// webpack.config.js

//...
rules: [
  //...
  {
    test: /\.css$/,
    use: [
      'vue-style-loader',
      'css-loader',
    ],
  },
  {
    test: /\.scss$/,
    use: [
      'vue-style-loader',
      'css-loader',
      'sass-loader',
    ],
  },
  {
    test: /\.sass$/,
    use: [
      'vue-style-loader',
      'css-loader',
      {
        loader: 'sass-loader',
        options: {
          indentedSyntax: true,
        },
      },
    ],
  },
],
//...
```

Now you can use style tags within the .vue single file components:

```html
<style>
  .greeting {
    background: green;
  }
</style>
```

Scoped css:

```html
<style scoped>
  .greeting {
    background: green;
  }
</style>
```

Scss:

```html
<style lang="scss">
  .greeting {
    background: green;
  }
</style>
```

Sass:

```html
<style lang="sass">
  .greeting
    background: green;
</style>
```

## Using decorators to define a component

Components can also be defined using [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).
With the help of two additional packages, ([vue-class-component](https://github.com/vuejs/vue-class-component) and [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator)), our components can be rewritten in the following manner:

```ts
// src/components/HelloDecorator.ts

import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  template: `
    <div>
      <div>Hello {{name}}{{exclamationMarks}}</div>
      <button @click="decrement">-</button>
      <button @click="increment">+</button>
    </div>
  `,
})
export default class HelloDecorator extends Vue {
  @Prop() name!: string;
  @Prop() initialEnthusiasm!: number;

  enthusiasm = this.initialEnthusiasm;

  increment() {
    this.enthusiasm += 1;
  }
  decrement() {
    if (this.enthusiasm > 1) {
      this.enthusiasm -= 1;
    }
  }

  get exclamationMarks(): string {
    return Array(this.enthusiasm + 1).join('!');
  }
}
```

Instead of using `Vue.extend` to define our component, we create a class extending `Vue` and decorate it using the `@Component` decorator from the `vue-class-component` package (which was re-exported from the `vue-property-decorator` package).

Properties are defined by prefixing instance variables with the `@Prop()` decorator from the `vue-property-decorator` package.
Because the `--strictPropertyInitialization` option is on, we need to tell TypeScript that Vue will initialize our properties by appending a `!` to them.
This tells TypeScript "hey, relax, someone else is going to assign this property a value."

Regular instance variables, such as `enthusiasm` in our example, are automatically made available for data binding to the template, just as if they had been defined in the `data` field.
Note that all variables must be set to a value other than `undefined` for the binding to work.

Similarly, methods such as `increment` are treated as if they had been written in the `methods` field, and are automatically made available for the template.

Finally, computed properties like `exclamationMarks` are simply written as `get` accessors.

## React like templates with TSX

Its possible to use react like templates also with VueJs and TypeScript. To enable this option we need to add some babel packages as dependencies, a babel config and the webpack and TypeScript config needs to be changed.

See this [Diff](https://github.com/tamino-martinius/template-webpack-tsx-vue/compare/286d272f890ae13813e9e08f5f27b7759a75032d...2ada699a5197d1c82dc9d47afca6e8aad2c54436) for a detailed look in the changes needed.

A ready to fork Template is available at [tamino-martinius/template-webpack-tsx-vue](https://github.com/tamino-martinius/template-webpack-tsx-vue).

This solution currently has some downsides:
- All HTML-Elements used need to be listed in the `jsx.d.ts` file as done in this example with `div` and `button`.
- You can not use the VueJs attributes like v-model, everything in the render function need to be done the jsx or react way
- The types of the data attributes can't be inferred, so its highly recommended to use tsx with the decorator notation.

## HtmlWebpackPlugin

To improve our setup we can now add the `HtmlWebpackPlugin` by installing `html-webpack-plugin` as dev dependency:

```shell
npm install --save-dev html-webpack-plugin
```

This enables us to auto include the compiled js file and also the complete markup will be minified for production releases.

Add the following snippet to the list of plugins of the webpack config:

```js
// webpack.config.js

//...
plugins: [
  //...
  new htmlWebpackPlugin({
    template: './src/index.html',
    minify: process.env.NODE_ENV === 'production' ? {
      minifyJS: true,
      minifyCSS: true,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
    } : false,
  }),
],
//...
```

Our `index.html` file is still in the public folder. This file can now be moved to the `src` folder:

```html
<!-- src/index.html -->
<!doctype html>
<html>
<head>
  <title>Webpack Template for TypeScript & VueJs</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

## Local Dev Server

The `watch` mode is nice to have the code compiled on every change, but the browser still needs to be refreshed. This can be improved with the webpack dev server. This runs your code on a local url which makes the usage of relative paths and cors headers easier.

Install the dev server:

```shell
npm install --save-dev webpack-dev-server
```

Add the dev server to your webpack config:

```js
// webpack.config.js

//...
module.exports.devServer = {
  port: 3000,
  hot: true,
  host: 'localhost',
  historyApiFallback: true,
  noInfo: false,
  contentBase: './dist',
};
//...
```

Add a start script to the package json:

```json
  "scripts": {
    "build": "rm -rf dist && webpack",
    "build:production": "npm run build --production",
    "start": "webpack-dev-server --hot --inline --open -d",
    "watch": "npm run build -- --watch",
  },
```

## What next

You can [try out this application by cloning it from GitHub](https://github.com/tamino-martinius/template-webpack-typescript-vue).

Check out [vue-router](https://github.com/vuejs/vue-router) if you want that your application can show different views depending on the current URL.

You may also want to look into [Vuex](https://github.com/vuejs/vuex) if you're looking for [Redux](http://redux.js.org/)-style state management.

## Contributions

This template is based on [TypeScript-Vue-Starter](https://github.com/Microsoft/TypeScript-Vue-Starter/) by [Daniel Rosenwasser](https://github.com/DanielRosenwasser).
