import { createClient } from "redis";
import { Engine } from "./trade/engine";





async function main(){
 const engine=new Engine();
 const redisclient=createClient();
 await redisclient.connect();

console.log("redis connected ");

 while(true ){
   const response=await redisclient.rPop("messages " as string)
    if(!response){

    } else {
        engine.process(JSON.parse(response))
    }

}


}
main()