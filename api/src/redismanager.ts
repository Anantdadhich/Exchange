import { createClient, RedisClientType } from "redis";
import { MessagetoEngine } from "./types/to";
import { MessagefromOrderbook } from "./types";

export class RedisManager {
    private client :RedisClientType;
    private publisher:RedisClientType;
    private static instance:RedisManager;


    private constructor(){
        this.client=createClient();
        this.client.connect();
        this.publisher=createClient();
        this.publisher.connect();
    }


    public static getInstance(){
        if(!this.instance){
            this.instance=new RedisManager();
        }
        return this.instance;
    }
    //wwe send a message to redis 
    public sendAndAwait(message:MessagetoEngine){
        return new Promise<MessagefromOrderbook>((resolve)=>{
       const id=this.getrandomClientId();
       this.client.subscribe(id,(message)=>{
        this.client.unsubscribe(id);
        resolve(JSON.parse(message))
       });
       this.publisher.lPush("messages",JSON.stringify({clientId:id,message}));
        })
    }

    public  getrandomClientId(){
        return Math.random().toString(36).substring(2,15) +Math.random().toString(36).substring(2,15);
    }

}