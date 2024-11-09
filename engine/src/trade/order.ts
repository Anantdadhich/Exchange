import { BASE_CURRENCY } from "./engine";


export interface Order {
    price:number,
    quantity:number
    orderId:string,
    filled:number,
    side:"buy"|"sell",
    userId:string
}

export interface Fill {
    price:string,
    qty:number,
    tradeId:number,
    otherUserId:string,
    marketOrderId:string
}

export class OrderBook {
    bids:Order[];
    asks:Order[];
    baseAsset:string;
    quoteAsset:string=BASE_CURRENCY;
    lastTradeid:number;
    currentPrice:number;
    

    constructor(baseAsset:string,bids:Order[],asks:Order[],lastTradeid:number,currentPrice:number){
        this.bids=bids;
        this.asks=asks;
        this.lastTradeid=lastTradeid || 0;
        this.currentPrice=currentPrice || 0;
        this.baseAsset=baseAsset;
    }

    ticker(){
        return `${this.baseAsset}_${this.quoteAsset}`
    }

    getSnapshot(){
        return  {
            baseAsset:this.baseAsset,
            bids:this.bids,
             asks:this.asks,
             currrentPrice:this.currentPrice,
             lastTradid:this.lastTradeid

        } 
    }

    addOrder(order: Order): {
        executedQty: number,
        fills: Fill[]
    } {
     



        return{
            executedQty,
            fills
        }
    }

    matchBid(order:Order):{
        fills:Fill[],
        executedQty:number
    } {
        const fills:Fill[]=[];
        let executedQty=0;

        for(let i=0;i<this.asks.length;i++){
            if(this.asks[i].price <=order.price && executedQty <order.quantity){
                const filledqty=Math.min((order.quantity -executedQty),this.asks[i].quantity);
                executedQty +=executedQty;
                this.asks[i].filled +=filledqty;
                fills.push({
                    price:this.asks[i].price.toString(),
                    qty:filledqty,
                    tradeId:this.lastTradeid++,
                    otherUserId:this.asks[i].userId,
                    marketOrderId:this.asks[i].orderId
                });

            }
        }
        for(let i=0;i<this.asks.length;i++){
            if(this.asks[i].filled === this.asks[i].quantity){
                this.asks.splice(i,1);
                i--;
            }
        }
        return {
            fills,
            executedQty
        }
    }

    matchAsks(order:Order) :{fills:Fill[],executedqty:number}{
          const fills:Fill[]=[];
          let executedqty=0;

          for(let i=0;i<this.bids.length ;i++){
            if(this.bids[i].price >= order.price && executedqty < order.quantity ){
                const amountRemaining=Math.min(order.quantity -executedqty,this.asks[i].quantity);
                executedqty += amountRemaining;
                this.bids[i].filled +=amountRemaining;
                fills.push({
                    price:this.bids[i].price.toString(),
                    qty:amountRemaining,
                    tradeId:this.lastTradeid++,
                    otherUserId:this.bids[i].userId,
                    marketOrderId:this.bids[i].orderId
                })
            }
          }
          for(let i=0;i < this.bids.length;i++ ){
            if(this.bids[i].filled  ===this.bids[i].quantity){
                this.bids.splice(i,1);
                i--;
            }
          }
          return {
            fills,
            executedqty
          }
    }
}