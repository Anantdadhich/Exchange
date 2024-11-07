export const SUBSCRIBE="SUBSCRIBE"
export const UNSUBSCRICE="UNSUBSRIBE"

export type SubscribeMessage= {
    method:typeof SUBSCRIBE,
    params:string[]
}

export type UnSubscribeMessage ={
    method:typeof UNSUBSCRICE,
    params:string[]
}

export type Incomingmessage=SubscribeMessage | UnSubscribeMessage