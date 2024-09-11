import { useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import styles from "./EditInvoice.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../config";
import currencyIcon from "../../utils/currencyIcon";
import Loader from "../../Components/Loader/Loader";
import { useNavigate } from "react-router-dom";

function EditInvoice() {
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
  const [itemList, setItemList] = useState<ItemInterface[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await axios.get(
          `${baseUrl}/invoice/specific-invoice/${id}`
        );
        setInvoice(response?.data?.data);
        setItemList(response?.data?.itemsRecord || []);
        setTaxRecords(response?.data?.taxRecords || []);
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

  const handleItemChange = (
    id: number,
    field: "price" | "quantity",
    value: number
  ) => {
    setItemList((prevItemList) =>
      prevItemList.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = (item: ItemInterface) => {
    const taxes = taxMap.get(item.id) || [];
    const taxTotal = taxes.reduce(
      (sum, tax) => sum + (item.price * tax.rate * item.quantity) / 100,
      0
    );
    const subTotal = item.price * item.quantity;
    const total = subTotal + taxTotal;
    return { subTotal, total, totalTax: taxTotal };
  };

  async function handleSubmit() {
    try {
      setLoading(true)
      // Prepare the payload with calculated values
      const listContent = itemList.map((item) => {
        const { subTotal, total, totalTax } = calculateTotal(item);
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subTotal: subTotal,
          totalTax: totalTax,
          total: total
        };
      });
      
      console.log(listContent);
      
      const taxContent = taxRecords.flatMap((record) =>
        record.taxes.map((tax) => ({
          id: tax.id,
          title: tax.title,
          rate: tax.rate
        }))
      );
  
      // Send the request with the calculated data
      const response = await axios.put(`${baseUrl}/invoice/update-invoice/${id}`, {
        listContent,
        taxContent
      });
  
      if (response?.status === 200) {
        setLoading(false)
        navigate("/");
      }
    } catch (e: any) {
      setLoading(false)
      console.log(e.response);
    }
  }
  

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
                        const { subTotal, total, totalTax } =
                          calculateTotal(item);

                        return (
                          <tr key={item.id}>
                            <td className={`${styles.th}`}>{item.name}</td>
                            <td className={`${styles.th}`}>
                              <input
                                type="number"
                                value={item.quantity}
                                min="0"
                                className={styles.input}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "quantity",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </td>
                            <td className={`${styles.th}`}>
                              {currencyIcon(invoice?.currency)}
                              <input
                                type="number"
                                min="0"
                                className={styles.input}
                                value={item.price}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "price",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </td>
                            <td className={`${styles.th}`}>
                              {taxMap
                                .get(item.id)
                                ?.map((tax) => (
                                  <div key={tax.id}>
                                    {tax.title} ({tax.rate}%)
                                  </div>
                                ))}
                            </td>
                            <td className={`${styles.th}`}>
                              {currencyIcon(invoice?.currency)}
                              {totalTax.toFixed(2)}
                            </td>
                            <td className={`${styles.th}`}>
                              {currencyIcon(invoice?.currency)}
                              {total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                className={styles["submit-btn"]}
                onClick={handleSubmit}
              >
                Update Invoice
              </button>
            </>
          ) : (
            "Invoice not found"
          )}
        </div>
      </div>
    </>
  );
}

export default EditInvoice;
