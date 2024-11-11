import fs  from "fs"
import { Order, OrderBook } from "./order"
import { MessageFromApi } from "../types/fromApi"



export const BASE_CURRENCY="USDC"


interface UserBalance {
    [key:string]:{
        available:number,
        locked:number
    }
}

export class Engine {
    private orderbooks:OrderBook[]=[];
    private balances:Map<string,UserBalance>=new Map();


    constructor(){
     let snapshot=null;
     try {
        if(process.env.WITHSNAPSHOT) {
            snapshot=fs.readFileSync("./snapshot.json");

        }
     } catch (error) {
        console.log("no snapshot")
     }
     
     if(snapshot){
        const snapshotfind=JSON.parse(snapshot.toString());
        this.orderbooks=snapshotfind.orderbooks.map((o:any)=> new OrderBook(o.baseAsset,o.bids,o.asks,o,currentPrice,o.lastTradid));
         this.balances=new Map(snapshotfind.balances);



     }else {
        this.orderbooks =[new OrderBook(`USDC`,[],[],0,0)];
        this.setBaseInterval();
     }
     setInterval(()=>{
        this.saveSnapshot();
     },1000 *3);


    }

    saveSnapshot(){
     const savsnapshotbook={
        orderbooks:this.orderbooks.map(o => o.getSnapshot()),
        balances:Array.from(this.balances.entries())

     }
     fs.writeFileSync("/.snapshot.json",JSON.stringify(savsnapshotbook))
    }

    process({message,clientId}:{message:MessageFromApi,clientId:string}){
      switch(message.type){
        case "CREATE_ORDER":
            try {
            const {orderId,executedQty,fills}=this.createOrder();

            } catch (error) {
                
            }
        case "CANCEL_ORDER":
        case "ON_RAMP":
        case "GET_DEPTH":
        case "GET_OPEN_ORDERS":
      }
        

    }
    
    addOrderbookm(orderbook:OrderBook){
       this.orderbooks.push(orderbook)
    }


    createOrder(market:string,price:string,quantity:string,side:"buy"|"sell",userId:string){
        const orderbook=this.orderbooks.find(o =>o.ticker()===market);
        const baseasset=market.split("_")[0];
        const qouteasset=market.split("_")[1];
        
        if(!orderbook ){
            throw new Error("no order book ")
        }
        
        
        const order:Order={
            price:Number(price),
            quantity:Number(quantity),
            orderId:Math.random().toString(15).substring(2,15) +Math.random().toString(15).substring(2,15) ,
            filled:0,
            side,
            userId
        }
       
        const {fills,executedQty}=orderbook.addOrder(order);


        
    }

    
}
