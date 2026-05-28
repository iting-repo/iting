const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// <-- 1. Import plugin React Refresh
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');
const zlib = require('zlib');

// <-- 2. Chuyển đổi module.exports thành một hàm để nhận biết chế độ development
module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const isDev = !isProd;
  
  // Xác định file .env cần load
  // Mặc định: development -> .env.local, production -> .env.production
  // Có thể truyền --env APP_ENV=development để load .env.development
  const appEnv = env.APP_ENV || (isDev ? 'development' : 'production');
  const envPath = path.resolve(__dirname, `.env.${appEnv}`);
  const finalEnvPath = fs.existsSync(envPath) ? envPath : path.resolve(__dirname, '.env');

  // Load env variables để dùng trong DefinePlugin (cho import.meta.env)
  const envVars = dotenv.config({ path: finalEnvPath }).parsed || {};
  const envKeys = Object.keys(envVars).reduce((prev, next) => {
    prev[`import.meta.env.${next}`] = JSON.stringify(envVars[next]);
    return prev;
  }, {
    'import.meta.env.MODE': JSON.stringify(argv.mode),
    'import.meta.env.DEV': JSON.stringify(isDev),
    'import.meta.env.PROD': JSON.stringify(isProd),
  });

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      // Prod: [contenthash] để bypass browser cache khi nội dung đổi.
      // Dev: tên tĩnh để hot reload + devtools dễ map.
      filename: isProd ? 'bundle.[contenthash].js' : 'bundle.js',
      chunkFilename: isProd ? '[name].[contenthash].bundle.js' : '[name].bundle.js',
      assetModuleFilename: isProd ? 'assets/[name].[contenthash][ext]' : 'assets/[name][ext]',
      publicPath: '/',
      clean: true,
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      open: true,
      hot: true,
      liveReload: false,
      historyApiFallback: {
        disableDotRule: true,
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    module: {
      rules: [
        // Rule cho file JavaScript và JSX
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            // <-- 3. Thêm tùy chọn để babel-loader nhận plugin react-refresh
            options: {
              babelrc: false,
              presets: [
                ['@babel/preset-env', { modules: false }],
                ['@babel/preset-react', { runtime: 'automatic' }]
              ],
              plugins: [
                isDev && require.resolve('react-refresh/babel'),
              ].filter(Boolean),
            },
          },
        },
        // Rule cho file CSS — prod extract ra .css file để parallel-load + cache,
        // dev dùng style-loader cho HMR.
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        // Các rule cho tài nguyên khác giữ nguyên
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][hash][ext][query]',
          },
        },
        {
          test: /\.(mp4|webm|ogg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/videos/[name][hash][ext][query]',
          },
        },
        {
          test: /\.(pdf|docx?|xlsx?)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/documents/[name][hash][ext][query]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][hash][ext][query]',
          },
        },
      ],
    },
    // Cấu hình plugin
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: './index.html',
        favicon: path.resolve(__dirname, 'src/assets/logo-iting.png'),
      }),
      // <-- 4. Thêm plugin React Refresh vào mảng, chỉ khi ở chế độ development
      isDev && new ReactRefreshWebpackPlugin(),
      new Dotenv({
        path: finalEnvPath,
        systemvars: true,
      }),
      new webpack.DefinePlugin(envKeys),
      // Gzip + Brotli compression cho prod — nginx tự serve .gz/.br nếu client support
      // Extract CSS thành file riêng cho prod → browser parse CSS song song với JS,
      // không cần JS execute trước để inject CSS (giảm TBT).
      isProd && new MiniCssExtractPlugin({
        filename: 'styles.[contenthash].css',
        chunkFilename: '[name].[contenthash].css',
      }),
      isProd && new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg|json)$/,
        threshold: 10240,    // chỉ nén file > 10KB
        minRatio: 0.8,
      }),
      isProd && new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg|json)$/,
        threshold: 10240,
        minRatio: 0.8,
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
      }),
    ].filter(Boolean), // .filter(Boolean) để loại bỏ các giá trị false nếu isDevelopment là false
    // Cấu hình để import không cần đuôi file
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    // Tách vendor / runtime để giảm main bundle, cải thiện FCP/LCP và cache hit rate
    // giữa các route. Chỉ áp dụng cho prod — dev giữ HMR đơn giản.
    optimization: isProd ? {
      runtimeChunk: 'single',
      moduleIds: 'deterministic',
      minimize: true,
      minimizer: [
        // Terser với passes=2 + mangle để giảm bundle size thêm ~5-10%
        new TerserPlugin({
          terserOptions: {
            compress: { passes: 2, drop_console: false, drop_debugger: true },
            mangle: true,
            format: { comments: false },
          },
          extractComments: false,
        }),
        // Minify CSS — Lighthouse báo save 6 KiB
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          // React core: rất hot, tách riêng để cache lâu.
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-is)[\\/]/,
            name: 'vendor-react',
            priority: 40,
            reuseExistingChunk: true,
          },
          // Redux + saga + immer: state layer chung toàn app.
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux|redux|redux-saga|immer)[\\/]/,
            name: 'vendor-redux',
            priority: 35,
            reuseExistingChunk: true,
          },
          // Router.
          router: {
            test: /[\\/]node_modules[\\/]react-router(-dom)?[\\/]/,
            name: 'vendor-router',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Charts: chỉ dùng ở dashboard/report, nặng nhưng không cần trên home.
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts|d3-.*|victory-vendor)[\\/]/,
            name: 'vendor-charts',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Quill editor: rất nặng, chỉ dùng ở blog/post.
          quill: {
            test: /[\\/]node_modules[\\/](react-quill-new|quill)[\\/]/,
            name: 'vendor-quill',
            priority: 25,
            reuseExistingChunk: true,
          },
          // i18n.
          i18n: {
            test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
            name: 'vendor-i18n',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Icons: react-icons + lucide.
          icons: {
            test: /[\\/]node_modules[\\/](react-icons|lucide-react)[\\/]/,
            name: 'vendor-icons',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Phần còn lại.
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    } : undefined,
    performance: {
      hints: false,
    },
  };
};
