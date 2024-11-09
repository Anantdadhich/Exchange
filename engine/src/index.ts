import { createClient } from "redis";





async function mai(){
 const engine=new Engine();
 const redisclient=createClient();
 await redisclient.connect();

console.log("redis connected ");

 while(true ){
   const response=await redisclient.rPop("messages " as string)
    if(!response){

    } else {
        
    }

}


}