const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.vue$/,
      loader: "vue-loader",
    });

    config.plugins.push(new VueLoaderPlugin());

    return config;
  },
};
