import {Client} from "pg";
import {createClient} from "redis"
import { DbMessage } from "./types";



const pgclient=new Client({
       user:"user",
    host:"localhost",
    database:"my_database",
    password:"password",
    port:5432
})

pgclient.connect();

async function  main() {
    const redisClient=createClient();
    await redisClient.connect()

   console.log("redis conne")

   while(true){
    const response=await redisClient.rPop("db_processor"as string)
    if(!response){

    }else {
        const data:DbMessage=JSON.parse(response);
        if(data.type ==="TRADE_ADDED"){
            console.log("adding");
            console.log(data);
          const price=data.data.price;
         const timestamp=new Date(data.data.timestamp);
           const query='INSERT INTO tata_prices (time, price) VALUES ($1, $2)';
             const values=[timestamp,price];
             await pgclient.query(query,values)
        }
    }
   }

}
main();