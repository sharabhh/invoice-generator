import express from 'express'
import { PrismaClient } from '@prisma/client'
import invoiceNumberGenerator from '../utils/invoiceNumberGenerator'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', (req,res)=>{
    res.send("hello")
})

console.log(invoiceNumberGenerator())

// create new invoice
router.post('/new', async (req,res) =>{
    const {clientName, date, invoiceNumber, currency, list, subTotal, totalTaxes, Total} = req.body
}) 

export default router