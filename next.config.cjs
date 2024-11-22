const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['magazine.altherr.de'], // Add your image domain here
  },
  swcMinify: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    return config;
  },
};

module.exports = nextConfig;
