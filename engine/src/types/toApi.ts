export const CREATE_ORDER="CREATE_ORDER";
export const CANCEL_ORDER="CANCEL_ORDER";
export const ONRAMP="ON_RAMP";
export const GET_OPEN_ORDERS="GET_OPEN_ORDERS";


export const GET_DEPTH="GET_DEPTH";


export type MessagetoApi={
    type:"DEPTH",
    payload:{
      bids:[string,string][],
      asks:[string,string][]
    }
} | {
    type:"ORDER_PLACED",
    payload:{
        orderId:string,
        executedqty:number,
        fills:[
            {
                price:string,
                qty:number,
                tradeId:number
            }[]
        ]
    }
} | {
    type:"ORDER_CANCELLED",
    payload:{
        orderId:string,
        executedqty:number,
        remainingqty:number
    }
} | {
    type:"OPEN_ORDERS",
    payload: Order[]
}