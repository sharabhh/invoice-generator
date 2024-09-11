import express from "express";
import { PrismaClient } from "@prisma/client";
import invoiceNumberGenerator from "../utils/invoiceNumberGenerator";
import {
  dateSchema,
  currencySchema,
  clientNameSchema,
  arrayOfItemsSchema,
  arrayOfItemPutSchema,
  arrayOfTaxPutSchema,
} from "../utils/dataValidation";

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

// fetch specific records
router.get("/specific-invoice/:invoiceId", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const invoiceRecord = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: invoiceId,
      },
    });

    const itemsRecord = await prisma.listItem.findMany({
      where: {
        invoiceId: invoiceRecord?.id,
      },
    });

    const taxRecords = await Promise.all(
      itemsRecord.map(async (item) => {
        const taxes = await prisma.tax.findMany({
          where: {
            listItemId: item.id,
          },
        });
        return { itemId: item.id, taxes };
      })
    );

    if (!invoiceRecord || !itemsRecord || !taxRecords) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({ data: invoiceRecord, itemsRecord, taxRecords });
  } catch (e) {
    res.status(500).json({ msg: "error fetching records", e });
  }
});

// create new invoice
router.post("/new", async (req, res) => {
  const { date, currency, items, clientName } = req.body;
  const generatedInvoiceNumber = invoiceNumberGenerator();

  const dateValidate = dateSchema.safeParse(date);
  const currencyValidate = currencySchema.safeParse(currency);
  const clientNameValidate = clientNameSchema.safeParse(clientName);
  const itemsSchemaValidate = arrayOfItemsSchema.safeParse(items);

  console.log(
    dateValidate,
    currencyValidate,
    clientNameValidate,
    itemsSchemaValidate
  );

  if (
    !dateValidate.success ||
    !currencyValidate.success ||
    !clientNameValidate.success
  ) {
    return res.status(400).json({ msg: "incorrect data format" });
  }

  // formatting date in YYYY-MM-DD format
  const parsedDate = new Date(date);
  const dateString = parsedDate.toISOString().split("T")[0];
  console.log(dateString);

  try {
    const newInvoice = await prisma.invoice.create({
      data: {
        date: dateString,
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

    res.status(201).json(updatedInvoice);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Something went wrong" });
  }
});

// update specific records
router.put("/update-invoice/:invoiceId", async (req, res) => {
  try {
    const invoiceNumber = req.params.invoiceId;

    const { listContent, taxContent } = req.body;

    // Validate the input data
    const validateListContent = arrayOfItemPutSchema.safeParse(listContent);
    const validateTaxContent = arrayOfTaxPutSchema.safeParse(taxContent);

    if (!validateListContent.success || !validateTaxContent.success) {
      return res.status(400).json({ msg: "Invalid data format" });
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Find the invoice by invoiceNumber
      const invoice = await prisma.invoice.findUnique({
        where: { invoiceNumber: invoiceNumber },
        include: {
          list: true,  // Ensure related list items are included
        },
      });

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Update each list item
      for (const item of listContent) {
        const listItem = await prisma.listItem.findUnique({
          where: { id: item.id },
          include: {
            taxes: true,  // Ensure related taxes are included
          },
        });

        if (!listItem || listItem.invoiceId !== invoice.id) {
          return res.status(404).json({ message: `List item with ID ${item.id} not found` });
        }

        await prisma.listItem.update({
          where: { id: item.id },
          data: {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subTotal: item.subTotal,
            totalTax: item.totalTax,
            total: item.total,
          },
        });
      }

      // Update taxes
      // for (const tax of taxContent) {
      //   const taxItem = await prisma.tax.findUnique({
      //     where: { id: tax.id },
      //     include: {
      //       listItem: true,  // Ensure the related list item is included
      //     },
      //   });

      //   if (!taxItem || taxItem.listItemId !== invoice.id) {
      //     return res.status(404).json({ message: `Tax with ID ${tax.id} not found` });
      //   }

      //   await prisma.tax.update({
      //     where: { id: tax.id },
      //     data: {
      //       title: tax.title,
      //       rate: tax.rate,
      //     },
      //   });
      // }

      // Recalculate totals
      const totalSubTotal = listContent.reduce((acc: any, item: any) => acc + item.subTotal, 0);
      const totalTaxes = listContent.reduce((acc: any, item: any) => acc + item.totalTax, 0);
      const totalAmount = listContent.reduce((acc: any, item: any) => acc + item.total, 0);

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          subTotal: totalSubTotal,
          totalTaxes: totalTaxes,
          total: totalAmount,
        },
      });

      console.log("Invoice, list items, and taxes updated successfully.");
      res.status(200).json({ msg: "Successfully updated." });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "An error occurred while updating." });
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
