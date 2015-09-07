module.exports = {
    // configuration
    resolve: {
        root: __dirname,
        alias: {
            'noe-autocomplete': 'lib'
        },
        modulesDirectories: ['node_modules', 'public/bower']
    },

    loaders: [
        { test: /\.mustache$/, loader: 'mustache'}
    ]
};
