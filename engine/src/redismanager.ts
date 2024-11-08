import { createClient, RedisClientType } from "redis";

export const TRADED_ADDED="TRADE_ADDED";
export const ORDER_UPDATE="ORDER_UPDATE";


type DbMessage ={
    type:typeof  TRADED_ADDED,
    data:{
        id:string,
        isBuyerMaker:boolean,
        price:string,
        quantity:string,
        timestamp:string,
        QouteQunatity:string 
    }
} | {
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


}