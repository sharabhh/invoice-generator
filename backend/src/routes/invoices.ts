import express from "express";
import { PrismaClient } from "@prisma/client";
import invoiceNumberGenerator from "../utils/invoiceNumberGenerator";

const router = express.Router();
const prisma = new PrismaClient();

// fetch all records
router.get("/all-records", async (req, res) => {
  try {
    const records = await prisma.invoice.findMany();
    res.status(200).json({ data: records });
  } catch (e) {
    res.status(500).json({ msg: "error fetching records", e });
  }
});

router.get("/specific-invoice/:invoiceId", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const record = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: invoiceId,
      },
    });

    if (!record) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({ data: record });
  } catch (e) {
    res.status(500).json({ msg: "error fetching records", e });
  }
});

// create new invoice
router.post("/new", async (req, res) => {
  const { date, currency, items, clientName } = req.body;
  const generatedInvoiceNumber = invoiceNumberGenerator();

  try {
    const newInvoice = await prisma.invoice.create({
      data: {
        date: new Date(date),
        invoiceNumber: generatedInvoiceNumber,
        currency,
        clientName,
        list: {
          create: items.map((item: any) => {
            const subTotal = item.price * item.quantity;
            const totalTax = item.taxes.reduce(
              (acc: any, tax: any) => acc + subTotal * (tax.rate / 100),
              0
            );
            return {
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              taxes: {
                create: item.taxes.map((tax: any) => ({
                  title: tax.title,
                  rate: tax.rate,
                })),
              },
              subTotal,
              totalTax,
              total: subTotal + totalTax,
            };
          }),
        },
      },
      include: {
        list: {
          include: {
            taxes: true,
          },
        },
      },
    });

    // Calculate invoice totals
    const invoiceSubTotal = newInvoice.list.reduce(
      (acc, item) => acc + item.subTotal,
      0
    );
    const invoiceTotalTax = newInvoice.list.reduce(
      (acc, item) => acc + item.totalTax,
      0
    );
    const invoiceTotal = newInvoice.list.reduce(
      (acc, item) => acc + item.total,
      0
    );

    // Update the invoice with the calculated totals
    const updatedInvoice = await prisma.invoice.update({
      where: { id: newInvoice.id },
      data: {
        subTotal: invoiceSubTotal,
        totalTaxes: invoiceTotalTax,
        total: invoiceTotal,
      },
    });

    res.json(updatedInvoice);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Something went wrong" });
  }
});

// delete specific records via query params
router.delete(`/delete-invoice/:invoiceId`, async (req, res) => {
  const invoiceId = req.params.invoiceId;
  console.log(invoiceId);

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const invoiceTableId = await prisma.invoice.findFirst({
        where: {
          invoiceNumber: invoiceId,
        },
      });

      // console.log(invoiceTableId);

      if (!invoiceTableId) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const listItems = await prisma.listItem.findMany({
        where: {
          invoiceId: invoiceTableId?.id,
        },
      });

      // finding all list ids
      const listItemIds = listItems.map((item) => item.id);
      console.log(listItemIds);

      await prisma.tax.deleteMany({
        where: {
          listItemId: { in: listItemIds },
        },
      });

      // delete the list items with invoiceId
      await prisma.listItem.deleteMany({
        where: {
          invoiceId: invoiceTableId?.id,
        },
      });

      // delete the invoice
      await prisma.invoice.delete({
        where: {
          invoiceNumber: invoiceId,
        },
      });
    });

    res.status(200).json({ message: "deleted" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Error while deletion", e });
  }
});

export default router;
