const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  webpack: (config, {
    // eslint-disable-next-line no-unused-vars
    buildId, dev, isServer, defaultLoaders,
  }) => {
    // Perform customizations to webpack config
    if (dev) {
      config.module.rules.unshift({
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          // Emit errors as warnings for dev to not break webpack build.
          // Eslint errors are shown in console for dev, yay :-)
          emitWarning: dev,
        },
      });
    }
    config.plugins.push(new SWPrecacheWebpackPlugin({
      verbose: true,
      staticFileGlobsIgnorePatterns: [/\.next\//],
      runtimeCaching: [
        {
          handler: 'networkFirst',
          urlPattern: /^https?.*!/,
        },
      ],
    }));
    // Important: return the modified config
    return config;
  },
  webpackDevMiddleware: config =>
  // Perform customizations to webpack dev middleware config

  // Important: return the modified config
    config,

  exportPathMap() {
    return {
      '/': { page: '/' },
    };
  },

};
