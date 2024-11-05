import {Router } from "express";
import { RedisManager } from "../redismanager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types";


export const orderbookrouter=Router();


orderbookrouter.post("/create",async(req,res)=>{
     const {market,price,quantity,side,userId}=req.body;

     console.log({market,price,quantity,side,userId})


     const response=await RedisManager.getInstance().sendAndAwait({
      type:CREATE_ORDER,
      data:{
        market,
        price,
        quantity,
        side,
        userId
      }
     })
     res.json(response.payload)
})

orderbookrouter.delete("/",async (req,res)=>{
    const {orderId,market}=req.body;
   
    const response=await RedisManager.getInstance().sendAndAwait({
        type:CANCEL_ORDER,
        data:{
            orderId,
            market
        }
    })
})

orderbookrouter.get("/open",async (req,res)=>{
    const response =await RedisManager.getInstance().sendAndAwait({
        type:GET_OPEN_ORDERS,
        data:{
            userId:req.query.userId as string,
            market:req.query.market as string
        }
    })
})