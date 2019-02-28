import path from 'path'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'


export default {
    entry:{
        vendor: ['vue'],
        sample:['./src/sample.js']
    },
    output: {
        path: path.resolve(__dirname, '../dist/sample/'),
        publicPath: 'dist/sample/',
        filename: '[name].js'//[chunkhash:8]
    },
    module: {
        rules: [{
                test: /\.vue$/,
                use: 'vue-loader'
            }, {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?' + JSON.stringify({
                        discardComments: { 
                            removeAll: true
                        }
                    })]
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css'), 
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js', 
            minChunks: Infinity 
        }),
         new CleanWebpackPlugin(
            ['./dist/sample/*.js', './dist/sample/*.css'], {
                root: path.resolve(__dirname, '../'), 
                verbose: false, 
                dry: false 
            }
        )
    ],
    devServer: {
        stats: 'errors-only'
    }
}