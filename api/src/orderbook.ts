interface Order {
    price:number,   //the price per unit of thje asset   means 1btc =25000usdc
    quantity:number,  //the amount of asset the  order 1btc 
    orderId:string,
}
//we will add them as side field to differ bw them
interface Bid extends Order {
    side:'bid'
}

interface Ask extends Order {
   side:'asks'
}

interface OrderBook {
    bids:Bid[],
    asks:Ask[]
}
//we make the when the order will populated so user place order and buy sell orders 
export const orderbook:OrderBook={
   bids:[],
   asks:[]
    
}
//key is the price, and the value is the total quantity of all buy orders at that price.
//market depth visualisation by grouping orders by price for traders to see how much liquidity is available

export const bookwithQuantity:{bids:{[price:number]:number};asks:{[price:number]:number}}={
    asks:{},
    bids:{}
}

