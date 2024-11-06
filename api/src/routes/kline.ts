//we use postgress as database
import { Router } from "express";
import {Client} from "pg"

const pgclient=new Client({
    user:"user",
    host:"localhost",
    database:"my_database",
    password:"password",
    port:5432
})

pgclient.connect();

export const klineRouter=Router();

