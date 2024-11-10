import fs  from "fs"
import { OrderBook } from "./order"



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
}