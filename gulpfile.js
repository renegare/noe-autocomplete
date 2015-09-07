var gulp = require('gulp-help')(require('gulp')),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.conf'),
    glob = require('glob'),
    path = require('path'),
    _ = require('lodash')
    ;


gulp.task('default', ['help']);

function webpackLogger(done) {
    return function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
        done();
    };
}

gulp.task('webpack:dist', function(done) {
    webpack(_.assign(webpackConfig, {
        plugins: [
            new webpack.ResolverPlugin(
                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"])
            ),
                new webpack.ResolverPlugin(
                    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
                ),
                    new webpack.optimize.UglifyJsPlugin({minimize: true})
        ],

        entry: 'lib/index.js',

        output: {
            path: path.resolve(__dirname, 'public', 'dist'),
            filename: "noe-autocomplete.bundle.js",
            library: 'NoeAutocomplete'
        },

        loaders: [
            { test: /\.mustache$/, loader: 'mustache'},
        ]
    }), webpackLogger(done));
});

gulp.task('webpack:test', function(done) {
    webpack(_.assign(webpackConfig, {
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
    }), webpackLogger(done));
});


gulp.task('webpack:watch', ['webpack:test', 'webpack:dist'], function () {
    return gulp.watch([
        'lib/**/*',
        'tests/**/*'
    ], ['webpack:test', 'webpack:dist']);
});
