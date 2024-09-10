import { useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import styles from "./ViewInvoice.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../config";
import currencyIcon from "../../utils/currencyIcon";
import Loader from "../../Components/Loader/Loader";

function ViewInvoice() {
  interface InvoiceInterface {
    invoiceNumber: string;
    date: string;
    clientName: string;
    currency: string;
    subTotal: number;
    totalTaxes: number;
    total: number;
  }

  interface ItemInterface {
    id: number;
    name: string;
    price: number;
    quantity: number;
    invoiceId: number;
    subTotal: number;
    total: number;
    totalTax: number;
  }

  interface Tax {
    id: number;
    title: string;
    rate: number;
    listItemId: number;
  }

  interface TaxInterface {
    itemId: number;
    taxes: Tax[];
  }

  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceInterface | null>(null);
  const [itemList, setItemList] = useState<ItemInterface[]>([]); // Changed to an array
  const [taxRecords, setTaxRecords] = useState<TaxInterface[]>([]); // Changed to an array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await axios.get(
          `${baseUrl}/invoice/specific-invoice/${id}`
        );
        setInvoice(response?.data?.data);
        setItemList(response?.data?.itemsRecord || []); // Initialize as an empty array
        setTaxRecords(response?.data?.taxRecords || []); // Initialize as an empty array
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  // Create a map of taxes by item ID for easier access
  const taxMap = new Map<number, Tax[]>();
  taxRecords.forEach((record) => {
    taxMap.set(record.itemId, record.taxes);
  });

  return (
    <>
      <div>
        <Header />
        <div className={`${styles["body-container"]}`}>
          {loading ? (
            <Loader />
          ) : invoice ? (
            <>
              <div className={`${styles["top-part"]}`}>
                <h3>Invoice #{invoice.invoiceNumber}</h3>
                <h3>Date {invoice.date}</h3>
              </div>
              {/* main body */}
              <div className={`${styles["main-body"]}`}>
                <div className={`${styles["main-body-name"]}`}>
                  <h5>Client Name: {invoice.clientName}</h5>
                  <h5>Currency: {invoice.currency}</h5>
                </div>
                <div className={`${styles["main-table"]}`}>
                  <table className={`${styles.table}`}>
                    <thead>
                      <tr>
                        <th className={`${styles.th}`}>ITEM</th>
                        <th className={`${styles.th}`}>QUANTITY</th>
                        <th className={`${styles.th}`}>PRICE</th>
                        <th className={`${styles.th}`}>TAX</th>
                        <th className={`${styles.th}`}>TAX Amount</th>
                        <th className={`${styles.th}`}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemList.map((item) => {
                        const taxes = taxMap.get(item.id) || [];
                        const taxTotal = taxes.reduce(
                          (sum, tax) => sum + (item.price * tax.rate) / 100,
                          0
                        );

                        return (
                          <tr key={item.id}>
                            <td className={`${styles.th}`}>{item.name}</td>
                            <td className={`${styles.th}`}>{item.quantity}</td>
                            <td className={`${styles.th}`}>{currencyIcon(invoice?.currency)}{item.price}</td>
                            <td className={`${styles.th}`}>
                              {taxes.map((tax) => (
                                <div key={tax.id}>
                                  {tax.title} ({tax.rate}%)
                                </div>
                              ))}
                            </td>
                            <td className={`${styles.th}`}>
                              {currencyIcon(invoice?.currency)}
                              {item.totalTax}
                            </td>
                            <td className={`${styles.th}`}>
                              {currencyIcon(invoice?.currency)}
                              {item.total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            "Invoice not found"
          )}
        </div>
      </div>
    </>
  );
}

export default ViewInvoice;
