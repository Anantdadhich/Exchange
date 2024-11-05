import express from  "express"
import { OrderInputSchemA } from "./types";
import { bookwithQuantity, orderbook } from "./orderbook";
const app=express();

app.use(express.json());

const BASE_ASSET='SOL';

const QUOTE_ASSET='USD';

let GLOBAL_TRADE_ID=0;

//we placee orders wheere the traders can set the markrt

app.post('api/v1/order',(req,res)=>{
    const order=OrderInputSchemA.safeParse(req.body);

    if(!order.success){
         res.status(400).send(order.error.message);
        return ;
    }

    //we validate our order in the market 
const {baseAsset,quoteAsset,price,quantity,side,kind}=order.data;

const orderId=getOrderId();

if(baseAsset!= BASE_ASSET && quoteAsset != QUOTE_ASSET){
     res.status(400).send("invalid");
     return;
}

const {executedQty,fills}=fillOrder(orderId,price,quantity,side,kind);

res.send({
    orderId,
    executedQty,
    fills
})

});

app.listen(3000);

function getOrderId():string{
    return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15);
}

interface Fill{
    "price":number,
    "qty":number,
    "tradeid":number
}
//The system will execute as much of the order as possible immediately. If the full order cannot be executed, the remaining quantity is rejected.
function fillOrder(orderId:string,price:number,quantity:number,side:"sell"|"buy",type?:"ioc"):{
    status:"rejected"|"accepted";
    fills:Fill[];
    executedQty:number;
}{ // we store the details of each prtial trade occur 
   const fills:Fill[]=[];
   const maximumfillqty=getfillamount(price,quantity,side);//how much order can filled right now 

   let executedQty=0;

   if(type ==='ioc' && maximumfillqty < quantity){
    return {status:"rejected",executedQty:maximumfillqty,fills:[]}
   } 

    
   //for the buy
   if(side==='buy'){
    //we sort the asks to fill them in befroree the orrderbook
    // Check if the ask order’s price is less than or equal to the buyer’s price buyers won’t buy at higher prices
    orderbook.asks.forEach(o=>{
        if(o.price <=price && quantity >0){
            const filledquantity=Math.min(quantity,o.quantity);
            //redcue the seller qunatity
            o.quantity -=filledquantity;

          bookwithQuantity.asks[o.price]=(bookwithQuantity.asks[o.price] ||0) -filledquantity;
            
          fills.push({
            price:o.price,
            qty:filledquantity,
            tradeid:GLOBAL_TRADE_ID++
          })
          //we uodate the executed quantity
        executedQty +=filledquantity;
        quantity -=filledquantity;

        if(o.quantity===0){
            orderbook.asks.splice(orderbook.asks.indexOf(o),1);
       }
      
       if(bookwithQuantity.asks[price]===0){
          delete bookwithQuantity.asks[price];
       }


        }
    })
    
    if(quantity !==0){
        orderbook.bids.push({
            price,
            quantity:quantity-executedQty,
            side:"bid",
            orderId
        })
        bookwithQuantity.bids[price]=(bookwithQuantity.bids[price]||0)-(quantity-executedQty);

   }
 
  }else{
    orderbook.bids.forEach(o=>{
        if(o.price >=price && quantity>0){
            const filledquantity=Math.min(quantity,o.quantity);
            o.quantity -=filledquantity;

            bookwithQuantity.bids[price]=(bookwithQuantity.bids[price]||0)-filledquantity;

            fills.push({
                price:o.price,
                qty:filledquantity,
                tradeid:GLOBAL_TRADE_ID
            })

            executedQty +=filledquantity;
            quantity -=filledquantity;;

            if(o.quantity===0){
                orderbook.bids.splice(orderbook.bids.indexOf(o),1);

            }

            if(bookwithQuantity.bids[price]===0){
                delete bookwithQuantity.bids[price];
            }

        }
    });

   if(quantity !==0){
    orderbook.asks.push({
        price,
        quantity:quantity,
        side:"asks",
        orderId
    })
    bookwithQuantity.asks[price]=(bookwithQuantity.asks[price]||0) +(quantity);
   }

  } 
  
  return {
    status:"accepted",
    executedQty,
    fills
  }
}

function getfillamount(price:number,quantity:number,side:"sell"|"buy"):number{
      let filled=0;
      if(side==="buy"){
       
        orderbook.asks.forEach(o=>{
          if(o.price<price){
            filled +=Math.min(quantity,o.quantity)
          }
        })

      }else{
        orderbook.bids.forEach(o=>{
            if(o.price<price){
                filled +=Math.min(quantity,o.quantity)
            }
        })
      }

      return filled;
}