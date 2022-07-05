var path = require('path');

module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist/assets/js'),
        filename: 'packed.js',
        libraryTarget: 'var',
        library: 'packed'
    }
};