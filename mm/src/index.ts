import axios from "axios";

const BASE_URL="http://localhost:3000";

const TOTALBIDS=15
const TOTALAKS=15
const MARKET="SOL_USDC"
const USERID=5


async function main(){
    const price=1000 + Math.random() * 10;
    const opneOrders=await axios.get(`${BASE_URL}/api/v1/order/open?userId =${USERID}&market=${MARKET}`)
    
    const totalBids=opneOrders.data.filter((o:any) => o.side==="buy").length;
    const totalAsks=opneOrders.data.filter((o:any)=> o.side==="sell").length;


    
 

}