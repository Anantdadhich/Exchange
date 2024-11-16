import { createClient, RedisClientType } from "redis";
import { WsMessage } from "./types/toWs";
import { MessagetoApi } from "./types/toApi";

export const TRADED_ADDED="TRADE_ADDED";
export const ORDER_UPDATE="ORDER_UPDATE";
//here we can do 
//queuing messages, publishing updates, and sending data to external clients or APIs

type DbMessage ={
    //as we see bro we use union types 
    //wehener the order added
    type:typeof  TRADED_ADDED,
    data:{
        id:string,
        isBuyerMaker:boolean,
        price:string,
        quantity:string,
        timestamp:number,
        qouteQunatity:string,
        market:string 
    }
} | {
    //whenver the order update 
    type:typeof ORDER_UPDATE,
    data:{
        orderId:string,
        executedQty:number,
        market?:string,
        price?:string,
        quantity?:string,
        side?:"buy"|"sell"
    }

}


export class RedisManager {
private client:RedisClientType;
// this ensures that we follow the sing patter
private static instance:RedisManager


constructor(){
    this.client=createClient();
    this.client.connect();
}

public static getInstance(){
    if(!this.instance){
        this.instance=new RedisManager();
        }
        return this.instance
}



//now we creat the where dbmessage push into a redis list 
  public Pushmessage(message:DbMessage){
    //lpush adds the message in the begenning
    this.client.lPush("db_processor",JSON.stringify(message))
  }
//here we publish the websockets message for real time updates 
  public publishmessage(channel:string,message:WsMessage){
    this.client.publish(channel,JSON.stringify(message))
  }
  //here we interact with api server 
  public sendToApi(clientId:string,message:MessagetoApi){
       this.client.publish(clientId,JSON.stringify(message))
  }
}