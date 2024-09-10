import {z} from "zod"

const dateSchema = z.coerce.date();
const currencySchema = z.enum(["INR", "USD", "EUR"]);
const clientNameSchema = z.string();
const itemsSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  taxes: z.array(
    z.object({
      title: z.string().optional(),
      rate: z.number().optional(),
    })
  ).optional(),
});

const arrayOfItemsSchema = z.array(itemsSchema)

// for put route
const itemPutSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  subTotal: z.number(),
  totalTax: z.number(),
  total: z.number()
})
const arrayOfItemPutSchema = z.array(itemPutSchema)

const taxPutSchema = z.object({
  id: z.number(),
  title: z.enum(["CGST", "SGST", "VAT"]),
  rate: z.number()
})
const arrayOfTaxPutSchema = z.array(taxPutSchema)

export {dateSchema, currencySchema, clientNameSchema, arrayOfItemsSchema, arrayOfItemPutSchema, arrayOfTaxPutSchema}