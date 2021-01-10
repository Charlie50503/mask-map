module.exports = {
	//默认情况下 babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。
	// transpileDependencies: ['webpack-dev-server/client'],
	// basic path
	/*ここのパスはserverのURL+publicPatchが画面のpage場所*/
	publicPath: './',
	// output directory 
	// is bundle folder name
	// eslint-loader　保存の時、文法・構文エラーをチェックするか
	lintOnSave: false,
	// outputDirの静的ファイル参照ディレクトリを指定
	assetsDir: './',
	// コンパイルがtemplate tagの利用が可能にする
	runtimeCompiler: true,
	// production mode に sourceMap ファイル作るのか
	productionSourceMap: false,
};
