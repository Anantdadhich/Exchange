"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const targetUrl = "https://api.backpack.exchange";
app.use("/", (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: targetUrl,
    changeOrigin: true,
    //@ts-ignore
    onProxyReq: (proxyReq, req, res) => {
    },
    //@ts-ignore
    onProxyRes: (proxyRes, req, res) => {
        // Optionally, you can modify the response here
    }
}));
app.listen(3000);
