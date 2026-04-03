const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// <-- 1. Import plugin React Refresh
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// <-- 2. Chuyển đổi module.exports thành một hàm để nhận biết chế độ development
module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
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
      historyApiFallback: {
        disableDotRule: true,
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
              plugins: [
                isDevelopment && require.resolve('react-refresh/babel'),
              ].filter(Boolean),
            },
          },
        },
        // Rule cho file CSS
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
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
      }),
      // <-- 4. Thêm plugin React Refresh vào mảng, chỉ khi ở chế độ development
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean), // .filter(Boolean) để loại bỏ các giá trị false nếu isDevelopment là false
    // Cấu hình để import không cần đuôi file
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  };
};
