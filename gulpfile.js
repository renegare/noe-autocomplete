var gulp = require('gulp-help')(require('gulp')),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    glob = require('glob'),
    path = require('path')
    ;


gulp.task('default', ['help']);

gulp.task('webpack:dist', function(done) {
    webpack({
        // configuration
        resolve: {
            root: __dirname,
            alias: {
                'noe-autocomplete': 'lib'
            },
            modulesDirectories: ['node_modules', 'bower']
        },

        plugins: [
            new webpack.ResolverPlugin(
                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"])
            ),
                new webpack.ResolverPlugin(
                    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
                ),
                    // new webpack.optimize.UglifyJsPlugin({minimize: true})
        ],

        entry: 'lib/index.js',

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: "noe-autocomplete.bundle.js",
            library: 'NoeAutocomplete'
        },

        loaders: [
            { test: /\.mustache$/, loader: 'mustache'}
        ]
    }, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);

        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        done();
    });
});

gulp.task('webpack:test', function(done) {
    webpack({
        // configuration
        resolve: {
            root: __dirname,
            alias: {
                'noe-autocomplete': 'lib'
            },
            modulesDirectories: ['node_modules', 'bower']
        },

        plugins: [
            new webpack.ResolverPlugin(
                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"])
            ),
                new webpack.ResolverPlugin(
                    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
                )
        ],

        entry: [
            'tests/jasmine-flight'
        ].concat(glob.sync('tests/**/*.spec.js')),

        output: {
            path: path.resolve(__dirname, 'tmp'),
            filename: "[name].spec.bundle.js"
        },

        loaders: [
            { test: /\.mustache$/, loader: 'mustache'}
        ],

        devtool: 'inline-source-map'
    }, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);

        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        done();
    });
});


gulp.task('webpack:watch', ['webpack:test', 'webpack:dist'], function () {
    return gulp.watch([
        'lib/**/*',
        'tests/**/*'
    ], ['webpack:test', 'webpack:dist']);
});
