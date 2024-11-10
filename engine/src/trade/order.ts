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
     
       if(order.side === "buy") {
        const {executedQty,fills}=this.matchBid(order);
        order.filled=executedQty;
        if(executedQty ===order.quantity){
            return {
                executedQty,
                fills
            }
        }
        this.bids.push(order);
        return {
            executedQty,
            fills
        }
       }else {
        const {executedQty,fills}=this.matchAsks(order);
        order.filled=executedQty;
        if(executedQty ===order.quantity){
            return {
                executedQty,
                fills
            }
        }
        this.asks.push(order);
        return {
            executedQty,
            fills
        }
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

    matchAsks(order:Order) :{fills:Fill[],executedQty:number}{
          const fills:Fill[]=[];
          let executedQty=0;

          for(let i=0;i<this.bids.length ;i++){
            if(this.bids[i].price >= order.price && executedQty < order.quantity ){
                const amountRemaining=Math.min(order.quantity -executedQty,this.asks[i].quantity);
               executedQty += amountRemaining;
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
            executedQty
          }
    }

    getDepth(){
        const bids:[string,string][]=[];
        const asks:[string,string][]=[];

        const bidsObj: {[key:string]:number}={};
        const asksObj: {[key:string]:number}={};


        for(let i=0;i < this.bids.length ;i++ ){
            const order=this.bids[i];
            if(!bidsObj[order.price]){
                bidsObj[order.price]=0;

            }
            bidsObj[order.price] +=order.quantity;
        }

        for(let i =0;i <this.asks.length;i++){
            const order= this.asks[i];
            if(!asksObj[order.price]){
                asksObj[order.price]=0;
            }
            bidsObj[order.price] +=order.quantity;

        }

        for (const price in bidsObj){
            bids.push([price,bidsObj[price].toString()])
        }

        for(const price in asksObj){
            asks.push([price,asksObj[price].toString()])
        }
        return {
            bids,
            asks
        };
    } 


    getOpenOrders(userId:string):Order[]{
        const asks=this.asks.filter(x=> x.userId ===userId)
        const bids=this.bids.filter(x=> x.userId ===userId)
        return [...asks,...bids] ;
    }

    cancelBid(order:Order){
        const index=this.bids.findIndex(x => x.orderId ===order.orderId);
        if (index !== -1){
            const price  =this.bids[index].price;
            this.bids.splice(index,1);
            return price

        }
    }

    cancelasks(order:Order){
        const index=this.asks.findIndex(x => x.orderId ===order.orderId);
        if(index !==-1){
            const price=this.asks[index].price;
            this.asks.splice(index,1);
            return price 
        }
    }
}