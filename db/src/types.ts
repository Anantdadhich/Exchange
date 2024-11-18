export type DbMessage={
    type:"TRADE_ADDED",
    data:{
        id: string,
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string
    } 
        }|{

        type:"ORDER_UPDATE",
        data:{
            orderId:string,
            executedQty:number,
             price?:string,
            market?:string,
            quantity?:string,
            side?:"buy"|"sell"
    }
}