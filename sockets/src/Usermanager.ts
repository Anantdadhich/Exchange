import { WebSocket } from "ws";
import { User } from "./User";
import { SubscriptionManger } from "./Subscriptionmanager";

export class UserManager {
    private static instance:UserManager;
    private users:Map<string,User>=new Map();


    private constructor(){

    }

    public static getInstance(){
        if(!this.instance){
            this.instance=new UserManager()
        }
        return this.instance
    }


    public addUser(ws:WebSocket){
        const id=this.getrandomid();
        const user=new User(id,ws);
        this.users.set(id,user);
        this.registeronclose(ws,id);
        return user;

    }

    private getrandomid(){
        return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    }

     private registeronclose(ws:WebSocket,id:string){
       ws.on("close",()=>{
        this.users.delete(id);
        SubscriptionManger.getInstance().userleft(id)
       });
     }

     public getUser(id:string){
        return this.users.get(id);
     }
}