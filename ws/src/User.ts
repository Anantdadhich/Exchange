import { WebSocket } from "ws";
import { OutgoingMessage } from "./types/out";
import { Incomingmessage, SUBSCRIBE, UNSUBSCRICE } from "./types/in";
import { SubscriptionManger } from "./Subscriptionmanager";


export class User {
    private id:string;
    private ws:WebSocket;



    constructor(id:string,ws:WebSocket){
        this.id=id;
        this.ws=ws;

        this.addlistners()
    }
     

    private Subscriptions:string[]=[];


    public subscribe(subscription:string){
        this.Subscriptions.push(subscription);
    }

    public unsubscribe(subscription:string){
       this.Subscriptions=this.Subscriptions.filter(s => s !==subscription);
    }

    emit(message:OutgoingMessage){
        this.ws.send(JSON.stringify(message))
    }

    private addlistners(){
        this.ws.on("message",(message:string)=>{
            const parsedMessage:Incomingmessage=JSON.parse(message);

            if(parsedMessage.method===SUBSCRIBE){
                parsedMessage.params.forEach(s => SubscriptionManger.getInstance().Subs(this.id,s))
            }
            if (parsedMessage.method===UNSUBSCRICE){
             parsedMessage.params.forEach(s => SubscriptionManger.getInstance().unSub(this.id,parsedMessage.params[0]))
            }
        })
    }

}