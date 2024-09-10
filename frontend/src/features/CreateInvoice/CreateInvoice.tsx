import styles from "./CreateInvoice.module.css";
import Header from "../../Components/Header/Header";
import { useState } from "react";
import axios from "axios";
import baseUrl from "../../config";

function CreateInvoice() {
  interface Tax {
    title: string;
    rate: number;
  }

  interface Item {
    name: string;
    price: number;
    quantity: number;
    taxes: Tax[];
  }

  interface Invoice {
    date: string;
    currency: string;
    clientName: string;
    items: Item[];
  }

  // Initialize state with empty values
  const [formData, setFormData] = useState<Invoice>({
    clientName: "",
    currency: "",
    date: "",
    items: [
      {
        name: "",
        price: 0,
        quantity: 0,
        taxes: [{ title: "CGST", rate: 0 }],
      },
    ],
  });
const [errorMsg, setErrorMsg] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMsg('')
  }

  function handleItemChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
    setErrorMsg('')
  }

  function handleTaxChange(
    itemIndex: number,
    taxIndex: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    const updatedTaxes = [...updatedItems[itemIndex].taxes];
    updatedTaxes[taxIndex] = { ...updatedTaxes[taxIndex], [name]: value };
    updatedItems[itemIndex].taxes = updatedTaxes;
    setFormData((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
    setErrorMsg('')
  }

  function addItem() {
    setFormData((prevData) => ({
      ...prevData,
      items: [
        ...prevData.items,
        { name: "", price: 0, quantity: 0, taxes: [{ title: "", rate: 0 }] },
      ],
    }));
  }

  function addTax(itemIndex: number) {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex].taxes.push({ title: "", rate: 0 });
    setFormData((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
  }

  async function handleSubmit() {
    // Convert string values to numbers where necessary
    const preparedData: Invoice = {
      ...formData,
      items: formData.items.map((item) => ({
        ...item,
        price: parseFloat(item.price.toString()), // Convert price to number
        quantity: parseFloat(item.quantity.toString()), // Convert quantity to number
        taxes: item.taxes.map((tax) => ({
          ...tax,
          rate: parseFloat(tax.rate.toString()), // Convert rate to number
        })),
      })),
    };

    try {
      const response = await axios.post(`${baseUrl}/invoice/new`, preparedData);
      console.log(response);
    } catch (e: any) {
      const response = e.response
      if(response?.status === 400){
        setErrorMsg("Incomplete/Incorrect credentials")
      }
    }
  }
  console.log(formData);

  return (
    <>
      <div>
        <Header />
        <div className={styles.body}>
          <div className={`${styles["top-part"]}`}>
            <input
              className={styles.input}
              type="text"
              placeholder="Client Name"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
            />
            <input
              className={styles.input}
              type="date"
              placeholder="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
            <select
              name="currency"
              className={styles.input}
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <h4>Items</h4>
          <div className={`${styles["item-list"]}`}>
            <hr className={`${styles.hr}`} />
            {formData.items.map((item, index) => (
              <div key={index} className={`${styles["item-list-inputs"]}`}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={`Item ${index + 1} Name`}
                  name="name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, e)}
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Quantity"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                />
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Price"
                  name="price"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, e)}
                />
                {item.taxes.map((tax, taxIndex) => (
                  <div
                    key={taxIndex}
                    className={`${styles["item-list-inputs"]}`}
                  >
                    <select
                      className={styles.input}
                      name="title"
                      value={tax.title}
                      onChange={(e) => handleTaxChange(index, taxIndex, e)}
                    >
                      <option value="CGST">CGST</option>
                      <option value="SGST">SGST</option>
                      <option value="VAT">VAT</option>
                    </select>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder={`Tax ${taxIndex + 1} Rate`}
                      name="rate"
                      value={tax.rate}
                      onChange={(e) => handleTaxChange(index, taxIndex, e)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTax(index)}
                  className={styles.addTaxButton}
                >
                  Add another tax
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className={styles.addTaxButton}
          >
            Add another item
          </button>
          <button
            className={`${styles.addTaxButton} ${styles.submitBtn}`}
            onClick={handleSubmit}
          >
            Submit
          </button>
          <p className={styles.error}>{errorMsg}</p>
        </div>
      </div>
    </>
  );
}

export default CreateInvoice;
