
module.exports = {
    webpack: {
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
            ],
        },
    },
    devServer: {
        compress: false,
        onBeforeSetupMiddleware(devServer) {
            let bodyParser = require('body-parser');
            devServer.app.use(bodyParser.urlencoded({ extended: true }));
            devServer.app.use(bodyParser.json());
        },
        proxy: {
            "/api/v1*": {
                target: "backend",
                selfHandleResponse: true,
                onProxyReq: (async function (proxyReq, req, res) {
                    res.send({});
                    res.end();
                })
            }
        }
    }
}