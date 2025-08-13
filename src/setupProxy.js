// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // REST API 프록시
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://pawnder.site',
            changeOrigin: true,
        })
    );
};
