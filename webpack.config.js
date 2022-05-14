const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './frontend/src/script.js',
    devtool: 'inline-source-map',
    devServer: {
        static: './frontend/static'
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, 'frontend/static') }
            ]
        }),
        new HtmlWebpackPlugin({
            template: "./frontend/src/index.html",
            minify: true
        }),
        new MiniCSSExtractPlugin()
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'frontend/dist'),
        clean: true,
    },
    optimization: {
        runtimeChunk: 'single',
    },
    module:
    {
        rules:
            [
                // HTML
                {
                    test: /\.(html)$/,
                    use:
                        [
                            'html-loader'
                        ]
                },

                // JS
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use:
                        [
                            'babel-loader'
                        ]
                },

                // CSS
                {
                    test: /\.css$/,
                    use:
                        [
                            MiniCSSExtractPlugin.loader,
                            'css-loader'
                        ]
                },

                // Images
                {
                    test: /\.(jpg|png|gif|svg)$/,
                    type: 'asset/resource',
                    generator:
                    {
                        filename: 'assets/images/[hash][ext]'
                    }
                },

                // Fonts
                {
                    test: /\.(ttf|eot|woff|woff2)$/,
                    type: 'asset/resource',
                    generator:
                    {
                        filename: 'assets/fonts/[hash][ext]'
                    }
                }
            ]
    }
};