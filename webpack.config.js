module.exports = {
  entry: __dirname + '/src/client.js',
  output: {
    path: __dirname + '/',
    filename: 'bundle.js'
  },
  devtool: 'source-maps',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['react', 'es2015'],
          plugins: ['react-html-attrs', 'transform-class-properties']
        }
      }
    ]
  }
}
