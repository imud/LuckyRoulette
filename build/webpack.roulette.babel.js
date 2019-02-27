import path from 'path'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'


export default {
    entry:{
        roulette:['./src/roulette/index.js']
    },
    output: {
        path: path.resolve(__dirname, '../dist/roulette/'),
        publicPath: 'dist/roulette/',
        filename: '[name].js',//[chunkhash:8]
		library:'Roulette',
		libraryTarget:'umd'
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
        // new ExtractTextPlugin('[name].css'), 
         new CleanWebpackPlugin(
            ['./dist/roulette/*.js', './dist/roulette/*.css'], {
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