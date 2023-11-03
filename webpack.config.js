const path = require('path');

module.exports = {

    module: {
        rules: [
            {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                },
            },
        },
        ],
    },

    resolve: {
        fallback: {
            'path': require.resolve('path-browserify'),
            'stream': require.resolve('stream-browserify'),
            'util': require.resolve('util'),
            'fs': false,
            'child_process': false,
            'os': require.resolve('os-browserify/browser'),
        },

    },


};