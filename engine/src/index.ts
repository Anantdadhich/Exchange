import express from "express"
import  { createProxyMiddleware } from "http-proxy-middleware"

const app=express()
app.use(express.json())


const targetUrl="https://api.backpack.exchange";

app.use("/",createProxyMiddleware({
    target:targetUrl,
    changeOrigin:true,
    //@ts-ignore
    onProxyReq:(proxyReq,req,res)=>{

    },
    //@ts-ignore
     onProxyRes: (proxyRes, req, res) => {
        // Optionally, you can modify the response here
    }
}))

app.listen(3000);