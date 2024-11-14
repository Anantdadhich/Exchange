import fs  from "fs"
import { Fill, Order, OrderBook } from "./order"
import { MessageFromApi } from "../types/fromApi"
import { ORDER_UPDATE, RedisManager, TRADED_ADDED } from "../redismanager"



export const BASE_CURRENCY="USDC"


interface UserBalance {
    [key:string]:{
        available:number,
        locked:number
    }
}

export class Engine {
    //orderbooks 
    private orderbooks:OrderBook[]=[];
    private balances:Map<string,UserBalance>=new Map();


    constructor(){
        //now we want to capture the state of an orderbook

        // When a new client connects to the exchange, they typically receive a full snapshot of the current order book. This allows them to have an accurate starting point.
     let snapshot=null; ///we will update the exchange 
     try {
        if(process.env.WITHSNAPSHOT) {
            snapshot=fs.readFileSync("./snapshot.json");

        }
     } catch (error) {
        console.log("no snapshot")
     }
     
     if(snapshot){
        const snapshotfind=JSON.parse(snapshot.toString());
        this.orderbooks=snapshotfind.orderbooks.map((o:any)=> new OrderBook(o.baseAsset,o.bids,o.asks,o.currentPrice,o.lastTradid));
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
            const {orderId,executedQty,fills}=this.createOrder(message.data.market,message.data.price,message.data.quantity,message.data.side,message.data.userId);
            RedisManager.getInstance().sendToApi(clientId,{
                type:"ORDER_PLACED",
                payload:{
                    orderId,
                    executedQty,
                    fills
                }
            });

            } catch (error) {
                console.log(error);
                RedisManager.getInstance().sendToApi(clientId,{
                    type:"ORDER_CANCELLED",
                    payload:{
                        orderId:"",
                        executedqty:0,
                        remainingqty:0
                    }
                })
            }
            break;
        case "CANCEL_ORDER":
           try {
            const orderId=message.data.orderId
            const cancelmarketorder=message.data.market
            const canceorderbook=this.orderbooks.find(x => x.ticker()===cancelmarketorder);

            const qouteasset=cancelmarketorder.split("_")[1];

            if(!canceorderbook){
                throw new Error("order cancled")
            }

            const order=canceorderbook.asks.find(o => o.orderId===orderId) || canceorderbook.bids.find( o  => o.orderId ===orderId)
                if(!order){
                throw new Error("order cancled")
            }

            if (order.side ==="buy"){
                const price=canceorderbook.cancelBid(order)
              
                const leftquantity=(order.quantity -order.filled) * order.price ;
                  //@ts-ignore
                this.balances.get(order.userId)[BASE_CURRENCY].available +=leftquantity;
                  //@ts-ignore
                this.balances.get(order.userId)[BASE_CURRENCY].locked -=leftquantity
 
                if(price){
                    this.sendUpdateDepthAt(price.toString(),cancelmarketorder);
                }
                
            }else {
                const price=canceorderbook.cancelasks(order)
                const leftquantity=order.quantity -order.filled;
            //@ts-ignore
             this.balances.get(order.userId)[qouteasset].available +=leftquantity;
              //@ts-ignore
             this.balances.get(order.userId)[qouteasset].locked -=leftquantity
            
                if(price){
                    this.sendUpdateDepthAt(price.toString(),cancelmarketorder);
                }
                
             
            
            }

            RedisManager.getInstance().sendToApi(clientId,{
                type:"ORDER_CANCELLED",
                payload:{
                    orderId,
                    executedqty:0,
                    remainingqty:0
                }
            })
        

           } catch (error) {
                console.log(error)
           }
          break;
        case "ON_RAMP":
            const userId=message.data.userId
            const amount=Number(message.data.amount)
            this.onRamp(userId,amount)

            break;
        case "GET_DEPTH":
            try {
                const market=message.data.market;
                const orderbook=this.orderbooks.find( o => o.ticker()=== market)
                 if(!orderbook){
                    throw new Error("no orderbook found")
                 }
                 RedisManager.getInstance().sendToApi(clientId, {
                    type:"DEPTH",
                    payload:orderbook.getDepth()
                 })

            } catch (error) {
                console.log(error)
                RedisManager.getInstance().sendToApi(clientId,{
                    type:"DEPTH",
                    payload:{
                        bids:[],
                        asks:[]
                    }
                })

            }
            break;
        case "GET_OPEN_ORDERS":
            try {
            const openorderbook=this.orderbooks.find( o=> o.ticker()===message.data.market)
               
            if(!openorderbook){
                throw new Error("no orderbook found")
            }
        
            const opneorders=openorderbook.getOpenOrders(message.data.userId)
              
            RedisManager.getInstance().sendToApi(clientId,{
                type:'OPEN_ORDERS',
                payload:opneorders
            })

            } catch (error) {
                console.log(error)
            }
      }
        

    }
    
    addOrderbookm(orderbook:OrderBook){
       this.orderbooks.push(orderbook);
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
       this.updateBalance(userId,baseasset,qouteasset,side,fills,executedQty);
       this.createDbTrades(fills,market,userId);
       this.updateDborders(order,executedQty,fills,market);
       this.publishWsDepthUpdates(fills,price,side,market)
       this.publishWTrades(fills,userId,market)
        
       return {executedQty,fills,orderId:order.orderId}
        
    }
   
    updateDborders(order:Order,executedQty:number,fills:Fill[],market:string){
        RedisManager.getInstance().Pushmessage({
            type:ORDER_UPDATE,
            data:{
                orderId:order.orderId,
                executedQty:executedQty,
                market:market,
                price:order.price.toString(),
                quantity:order.quantity.toString(),
                side:order.side
            }
        });

        fills.forEach(fill=>{
            RedisManager.getInstance().Pushmessage({
                type:ORDER_UPDATE,
                data:{
                    orderId:fill.marketOrderId,
                    executedQty:fill.qty
                }
            })
        })
    }

    createDbTrades(fills:Fill[],market:string,userId:string){
        fills.forEach(fill=>{
            RedisManager.getInstance().Pushmessage({
                type:TRADED_ADDED,
                data:{
                    market:market,
                    id:fill.tradeId.toString(),
                    isBuyerMaker:fill.otherUserId===userId,
                    price:fill.price,
                    quantity:fill.qty.toString(),
                    qouteQunatity:(fill.qty * Number(fill.price)).toString(),
                    timestamp:Date.now()
                }
            })
        })
    }



   publishWTrades(fills:Fill[],userId:string,market:string){
    fills.forEach(fill => {
        RedisManager.getInstance().publishmessage(`trade@{market}`,{
            stream:`trade@{market}`,
            data:{
                e:"trade",
                t:fill.tradeId,
                m:fill.otherUserId===userId,
                p:fill.price,
                q:fill.qty.toString(),
                s:market,
            }
        })
    })
   }


    publishWsDepthUpdates(fills:Fill[],price:string,side:"buy"|"sell",market:string){
        const orderbook=this.orderbooks.find(o => o.ticker()===market);
        if(!orderbook){
            return
        }

        const depth=orderbook.getDepth()
        if(side==="buy"){
            const updateAsks=depth?.asks.filter(x => fills.map(f=> f.price).includes(x[0].toString()))
           const updateBids=depth?.bids.filter(x => x[0]===price);

           console.log("publish ws depth  updates");
             
           RedisManager.getInstance().publishmessage(`depth@${market}`,{
                stream:`depth@${market}`,
                data:{
                    a:updateAsks,
                    //@ts-ignore
                    b:updateBids ? [updateBids] : [],
                    e:"depth"
                }
              });
        }
        if(side==="sell"){
        const updateAsks=depth?.asks.filter(x => fills.map(f=> f.price).includes(x[0].toString()))
           const updateBids=depth?.bids.filter(x => x[0]===price);

           console.log("publish ws depth  updates");
             
           RedisManager.getInstance().publishmessage(`depth@${market}`,{
                stream:`depth@${market}`,
                data:{
                    //@ts-ignore
                    a:updateAsks ? [updateAsks]:[],
                    b:updateBids,
                    e:"depth"
                }
              });
        }
    }

  updateBalance(userId:string,baseAsset:string,qouteasset:string,side:"buy"|"sell",fills:Fill[],executedQty:number){
     
    if(side === "buy"){
        fills.forEach(fill =>{
          //@ts-ignore
            this.balances.get(fill.otherUserId)[qouteasset].available=this.balances.get(fill.otherUserId)?.[qouteasset].available +(fill.qty * fill.price)
          
             //@ts-ignore
            this.balances.get(userId)[qouteasset].locked=this.balances.get(userId)?.[qouteasset].locked -(fill.qty * fill.price)
             //@ts-ignore
             this.balances.get(fill.otherUserId)[baseAsset].locked=this.balances.get(fill.otherUserId)?.[baseAsset].locked - fill.qty;
              //@ts-ignore

             this.balances.get(userId)[baseAsset].available=this.balances.get(userId)?.[baseAsset].available + fill.qty
       
        })
    }else {
       fills.forEach(fill =>{
        //@ts-ignore
        this.balances.get(fill.otherUserId)[qouteasset].locked=this.balances.get(fill.otherUserId)?.locked -(fill.qty* fill.price)
         //@ts-ignore
        this.balances.get(userId)[qouteasset].available=this.balances.get(userId)?.[qouteasset].available + (fill.qty* fill.price)
         //@ts-ignore

        this.balances.get(fill.otherUserId)[baseAsset].available=this.balances.get(fill.otherUserId)?.[baseAsset].available + fill.qty
          //@ts-ignore   
          this.balances.get(userId)[baseAsset].available=this.balances.get(userId)?.[baseAsset].available + fill.qty
       
    }) 


    }
  }  




  sendUpdateDepthAt(price:string,
    market:string
  ){
     const orderbook=this.orderbooks.find( o => o.ticker() ===  market)


     if(!orderbook){
        return 
     }

     const depth=orderbook.getDepth();
     const updateAsks=depth?.asks.filter(x => x[0]===price)
   
     const updateBids=depth?.bids.filter(x => x[0]===price)
 
     RedisManager.getInstance().publishmessage(`depth@${market}`,{
        stream:`depth@${market}`,
        data:{
            a:updateAsks.length  ?updateAsks :[[price,"0"]],
           b:updateBids.length ? updateBids :[[price,"0"]],
           e:"depth"
        }
     })
 
 
    }

   onRamp(userId:string,amount:number){
      const UserBalance=this.balances.get(userId);

      if(!UserBalance){
        this.balances.set(userId,{
            [BASE_CURRENCY]:{
                available:amount,
                locked:0
            }
        });
      }  else {
        UserBalance[BASE_CURRENCY].available +=amount
      }
   }


   setBaseInterval(){
    this.balances.set("1",{
        [BASE_CURRENCY]:{
            available:1000,
            locked:0
        },
        "SOL":{
            available:1000,
            locked:0
        }
    });

     this.balances.set("2",{
        [BASE_CURRENCY]:{
            available:1000,
            locked:0
        },
        "SOL":{
            available:1000,
            locked:0
        }
    });
        this.balances.set("3",{
        [BASE_CURRENCY]:{
            available:1000,
            locked:0
        },
        "SOL":{
            available:1000,
            locked:0
        }
    });
        this.balances.set("4",{
        [BASE_CURRENCY]:{
            available:1000,
            locked:0
        },
        "SOL":{
            available:1000,
            locked:0
        }
    });
        this.balances.set("5",{
        [BASE_CURRENCY]:{
            available:1000,
            locked:0
        },
        "SOL":{
            available:1000,
            locked:0
        }
    });
   }

}
