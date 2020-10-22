const path = require( "path" );
const CopyPlugin = require( "copy-webpack-plugin" );
const { CleanWebpackPlugin } = require( "clean-webpack-plugin" );
const Dotenv = require( "dotenv-webpack" );

const APP_VERSION = require( "./package.json" ).version;

module.exports = ( _, argv ) => {
    const isProduction = argv.mode === "production";

    return {
        entry: [
            "./src/index.ts",
            "./src/styles.scss"
        ],
        devtool: "source-map",
        module: {
            rules: [
                // Typescript files
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/
                },
                // SASS style files
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates CSS files
                        {
                            loader: "file-loader",
                            options: { name: `[name].${APP_VERSION}.css` }
                        },
                        // Compiles SASS to CSS
                        "sass-loader"
                    ]
                }
            ]
        },
        resolve: {
            extensions: [ ".tsx", ".ts", ".js" ]
        },
        output: {
            filename: `app.${APP_VERSION}.js`,
            path: path.resolve( __dirname, "build" )
        },
        devServer: {
            contentBase: path.join( __dirname, "assets" ),
            compress: true,
            port: process.env.PORT || 3000
        },
        plugins: [
            // Clear the build directory
            new CleanWebpackPlugin(),

            // Include assets
            new CopyPlugin({
                patterns: [
                    {
                        context: "./assets",
                        from: "**/*",
                        transform: ( content, path ) => {
                        // insert app version to templates
                            if( path.includes( ".html" ) ) {
                                return Buffer.from( content.toString().split( "{{version}}" ).join( APP_VERSION ) );
                            }

                            return content;
                        }
                    }
                ]
            }),

            // Read environment variables
            new Dotenv({
                path: isProduction ? ".env.production" : ".env"
            })
        ]
    };
};