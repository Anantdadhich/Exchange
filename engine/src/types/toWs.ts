export type TickerUpdateMessage ={
    stream:number,
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
    stream:string,
    data:{
        b?:[string,string][],
        a?:[string,string][],
        e:"depth"
    }
}

export type TradeAddedMessage ={
    stream:string,
    data:{
        e:"trade",
        t:number,
        m:boolean,
        p:string,
        q:string,
        s:string

    }
}


export type WsMessage=TickerUpdateMessage |DepthupdateMessage |TradeAddedMessage