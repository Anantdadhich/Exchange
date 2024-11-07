//from this we can manage the data and automate the data 

import axios from "axios";

const BASE_URL="http://localhost:3000";

const TOTALBIDS=15
const TOTALAKS=15
const MARKET="SOL_USDC"
const USERID=5


async function main(){
    //we generate the price 
    const price=1000 + Math.random() * 10;
    const opneOrders=await axios.get(`${BASE_URL}/api/v1/order/open?userId =${USERID}&market=${MARKET}`)
    
    const totalBids=opneOrders.data.filter((o:any) => o.side==="buy").length;
    const totalAsks=opneOrders.data.filter((o:any)=> o.side==="sell").length;
     
    const cancelbids=await cancelBids(opneOrders.data,price);
    const cancelasks=await cancelAsks(opneOrders.data,price);;


    let bidstoAdd=TOTALBIDS-totalBids-cancelbids;
    let askstoAdd=TOTALAKS-totalAsks-cancelasks;

    while(bidstoAdd > 0 || askstoAdd >0){
        if(bidstoAdd >0 ){
            await axios.post(`${BASE_URL}/api/v1/order`,{
                market:MARKET,
                price:(price-Math.random() *1).toFixed(1).toString(),
                quantity:"1",
                side:"buy",
                userId:USERID
            });
            bidstoAdd--;
        }
        if (askstoAdd >0 ){
            await axios.post(`${BASE_URL}/api/v1/order`,{
               market:MARKET,
               price:(price-Math.random()*1).toFixed(1).toString(),
               quantity:"1",
               side:"sell",
               userId:USERID
            })
            askstoAdd--;
        }

    }
    await new Promise(resolve =>setTimeout(resolve,1000))


    
 

}


async function cancelBids(opneOrders:any[],price:number) {
      let promises:any[]=[];

      opneOrders.map(o =>{
       if(o.side ==="buy" && (o.price > price || Math.random() < 0.1)) {
        promises.push(axios.delete(`${BASE_URL}/api/v1/order`,{
            data:{
                orderId:o.orderId,
                market:MARKET
            }
        }))
       }
      })

      await Promise.all(promises);
      return promises.length;
}

async function cancelAsks(opneOrders:any[],price:number) {
    let promises:any[]=[];

    opneOrders.map(o=>{
        if(o.side ==='asks' && (o.price >price || Math.random() < 0.5) ){
            promises.push(axios.delete(`${BASE_URL}/api/v1/order`,{
                data:{
                    orderId:o.orderId,
                    market:MARKET
                }
            }))
        }
    })


    await Promise.all(promises);
    return promises.length;
}

main()