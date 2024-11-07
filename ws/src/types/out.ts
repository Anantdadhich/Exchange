export type TickerUpdateMessage ={
    type:"ticker",
    data: {
       c?:string, //current price
       h?:string,  //highest price
       l?:string , //lowest price
       v?:string, //volume base
       V?:string,
       s?:string,  //symbol
       id:number,
       e:"ticker"
    }
}

export type DepthupdateMessage ={
    type:"depth",
    data:{
        b?:[string,string][],
        a?:[string,string][],
        id :number,
        e:"depth"
    }
}

export type OutgoingMessage=TickerUpdateMessage |DepthupdateMessage