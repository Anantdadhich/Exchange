import express from "express"
import cors from "cors"
import { orderbookrouter } from "./routes/order";
import { depthRouter } from "./routes/depth";
import { tradesRouter } from "./routes/trades";
import { klineRouter } from "./routes/kline";
import { tickerRouter } from "./routes/ticker";
const app=express();

app.use(express.json());
app.use(cors());


app.use("/api/v1/order",orderbookrouter);
app.use("/api/v1/depth",depthRouter);
app.use("/api/v1/trades",tradesRouter);
app.use("/api/v1/klines",klineRouter);
app.use("/api/v1/tickers",tickerRouter);

app.listen(3000 ,()=>{
    console.log("api server is runnig ")
})