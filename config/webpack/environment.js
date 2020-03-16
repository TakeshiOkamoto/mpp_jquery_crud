const { environment } = require('@rails/webpacker')

// エイリアスの設定をする
environment.toWebpackConfig().merge({
  resolve: {
      alias: {
               'jquery': 'jquery/src/jquery'
             }
           }
});

module.exports = environment
