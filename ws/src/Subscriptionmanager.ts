import { createClient, RedisClientType } from "redis";
import { UserManager } from "./Usermanager";



export class SubscriptionManger{
    // it is singleton pattern meaing onlty one instance can exist 
    private static instance:SubscriptionManger;
    //we keep track which channel of each user  subscribed 
    private Subscriptions:Map<string,string[]>=new Map();
    //which user is subs to channel
    private reverseSubscriptions:Map<string,string[]>=new Map();
    private redisClient :RedisClientType;


     private constructor(){
        this.redisClient=createClient();
        this.redisClient.connect()
     }


     public static getInstance(){
        if(!this.instance){
            this.instance=new SubscriptionManger();
        }
        return this.instance;
     }


     public Subs(userId:string,subscription:string){
              if(this.Subscriptions.get(userId)?.includes(subscription)){
                return  
              }

              this.Subscriptions.set(userId ,(this.Subscriptions.get(userId) || []).concat(subscription))
              this.reverseSubscriptions.set(subscription,(this.reverseSubscriptions.get(subscription)||[]).concat(userId));
        
              if(this.reverseSubscriptions.get(subscription)?.length===1){
                this.redisClient.subscribe(subscription,this.redcallbackhunter);
              }
   
            }

            private redcallbackhunter=(message:string,channel:string)=>{
              const parsedMessage=JSON.parse(message);
              this.Subscriptions.get(channel)?.forEach(s=>UserManager.getInstance().getUser(s)?.emit(parsedMessage))
            }

          public unSub(userId:string,subscription:string){
            const subscriptions=this.Subscriptions.get(userId);
            if(subscriptions){
              this.Subscriptions.set(userId,subscriptions.filter(s => s!==subscription))
            }


            const reversesubscriptions=this.reverseSubscriptions.get(subscription)

            if(reversesubscriptions){
              this.reverseSubscriptions.set(subscription,reversesubscriptions.filter(s => s!==userId))
                if(this.reverseSubscriptions.get(subscription)?.length===0){
                  this.reverseSubscriptions.delete(subscription);
                  this.redisClient.unsubscribe(subscription)
                }
            }
           
          
          }

        
           public userleft(userId:string){
            console.log("usser left"+userId)
            this.Subscriptions.get(userId)?.forEach(s=> this.unSub(userId,s)); 
           
          }

          getSubscriptions(userId:string){
            return this.Subscriptions.get(userId) || []
          }
        }