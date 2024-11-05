import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, ONRAMP } from "."


export type MessagetoEngine={
    type:typeof CREATE_ORDER,
    data:{
        market:string,
        price:string,
        quantity:string,
        side:"buy" |"sell",
        userId:string
    }
} |{
    type :typeof CANCEL_ORDER,
    data:{
        market:string,
        orderId:string
    }
} | {
    type:typeof ONRAMP,
    data:{
        amount:string,
        userId:string,
        txnId:string
    }
} | {
    type:typeof GET_DEPTH,
    data:{
        market:string
    }
} |{
    type:typeof  GET_OPEN_ORDERS,
    data:{
        userId:string,
        market:string
    }
}