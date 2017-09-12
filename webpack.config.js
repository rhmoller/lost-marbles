const path = require("path");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve("dist"),
        filename: "game.js"
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: "ts-loader"
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: "tslint-loader",
                enforce: "pre"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new ZipPlugin({
            filename: "rhmoller.zip"
        })
    ],
    devServer: {
        overlay: true,
        host: "0.0.0.0",
        allowedHosts: ["."],
        disableHostCheck: true
    }
};
