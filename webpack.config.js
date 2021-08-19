const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

//const jsConfig = require('./jsconfig.json');

module.exports = {
	entry: {
		'build/bundle': !prod ? [
			'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
			'./src/index.js'
		] : ['./src/index.js']
	},
	resolve: {
		alias: {
			svelte: path.dirname(require.resolve('svelte/package.json')),
			//...jsConfig.compilerOptions.paths
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
	output: {
		path: path.join(__dirname, '/public'),
		publicPath: '/',
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: !prod
						},
						emitCss: prod,
						hotReload: !prod
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				// required to prevent errors from Svelte on Webpack 5+
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				use: [
					'file-loader'
				]
			},
			/*
			{
				test: /\.svg$/i,
				use: [
					{
						loader: 'svg-url-loader',
					}
				]
			},*/
		]
	},
	optimization: {
		minimizer: [
			new CssMinimizerPlugin(),
		]
	},
	mode,
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new HtmlWebpackPlugin({
			template: './public/template.html'
		}),
	],
	devtool: prod ? false : 'source-map',
	devServer: {
		contentBase: './public',
		hot: true
	}
};
