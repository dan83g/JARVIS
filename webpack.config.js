const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const dev_mode = 'development';//'production';

module.exports = {
  // devtool: false,
  devtool: 'source-map',
  // devtool: 'inline-source-map',  
  mode: dev_mode,

  // autobuild after save
	watch: true,

  stats: 'minimal',
  entry: {
    index: './src/index/index.ts',
    search: './src/search/index.ts',
    map: './src/map/index.ts',
    dtsearch: './src/dtsearch/index.ts',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'static/code'),
    devtoolModuleFilenameTemplate: '[resource-path]',    
    // libraryTarget: 'var',
    // libraryExport: 'default',
    // globalObject: 'this',    
  },

  performance: {
    maxEntrypointSize: dev_mode == 'production' ? 244000 : 1000000,
    maxAssetSize: dev_mode == 'production' ? 244000 : 1000000,
  },  

  optimization: {    
    minimize: dev_mode == 'production' ? true : false,
    minimizer: [
      new TerserPlugin({
        extractComments: false,        
      })
    ],
  },

  // devServer: {    
  //   host: '0.0.0.0',
  //   path: path.join(__dirname, 'static'),
  // },  

	module: {
		rules: [
      {                
        test: /\.ts?$/,
        use: [{
                loader: 'ts-loader',
                options: {
                  configFile: "tsconfig.json",
                }
        }],
        exclude: /node_modules/,
      },      
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: { 
					loader: 'babel-loader',
				} 
			},
			{
				test: /\.css$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader" }
				],      
			},      
			{
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: '../images',
          }
        }
		  }
		]
	},
  resolve: {
    modules: [
        'src',
        'node_modules'
    ],
    extensions: [
        '.js',
        '.ts'
    ]
  },  
  plugins: [
    new webpack.SourceMapDevToolPlugin({filename: '[name].js.map'}),
    new WebpackNotifierPlugin({title: 'Webpack: OK!', emoji: true, alwaysNotify: true}),
  ]  
};