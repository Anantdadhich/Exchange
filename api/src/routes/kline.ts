//we use postgress as database
import { Router } from "express";
import {Client} from "pg"


const pgclient=new Client({
    user:"user",
    host:"localhost",
    database:"my_database",
    password:"password",
    port:5432
})

pgclient.connect();

export const klineRouter=Router();

//@ts-ignore
klineRouter.get("/", async (req,res) => {

    const {market,interval,startTime,endTime}=req.query ;
     
    let query;
    switch(interval){
        case '1m':
          query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
          break;
          case '1h':
          query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
          break;
         case '1w':
         query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
        break;   
        default :
        return res.status(400).send("invalid ")
    }

   

    try {
        //@ts-ignore
        const result =await pgclient.query(query,[new Date(startTime * 1000 as string),new Date(endTime *1000 as string)]) ;
        res.json(result.rows.map(x => ({
            close:x.close,
            high:x.high,
            end:x.end,
            open:x.open,
            qoutevolume:x.qoutevolume,
            start:x.start,
            trades:x.trades,
            volume:x.volume

        })));

    } catch (error) {
        console.log(error)
        res.status(400).send()
    }

})

