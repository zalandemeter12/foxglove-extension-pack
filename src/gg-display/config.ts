const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  webpack: (config) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.vue$/,
      loader: "vue-loader",
    });

    config.plugins = config.plugins || [];
    config.plugins.push(new VueLoaderPlugin());

    return config;
  },
};
