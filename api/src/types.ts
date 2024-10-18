import z from 'zod'

export const OrderInputSchemA=z.object({
    baseAsset:z.string(),
    quoteAsset:z.string(),
    price:z.number(),
    quantity:z.number(),
    side:z.enum(['buy','sell']),
    type:z.enum(['limit','market']),
    kind:z.enum(['ioc']).optional()
})