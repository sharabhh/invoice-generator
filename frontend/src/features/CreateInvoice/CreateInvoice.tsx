import styles from "./CreateInvoice.module.css";
import Header from "../../Components/Header/Header";
import { useState } from "react";
import axios from "axios";
import baseUrl from "../../config";
import currencyIcon from "../../utils/currencyIcon";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";

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

  const [formData, setFormData] = useState<Invoice>({
    clientName: "",
    currency: "USD",
    date: "",
    items: [
      {
        name: "",
        price: 0,
        quantity: 0,
        taxes: [
          { title: "CGST", rate: 0 },
          { title: "SGST", rate: 0 },
          { title: "VAT", rate: 0 },
        ],
      },
    ],
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMsg("");
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
    setErrorMsg("");
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
    setErrorMsg("");
  }

  function addItem() {
    setFormData((prevData) => ({
      ...prevData,
      items: [
        ...prevData.items,
        {
          name: "",
          price: 0,
          quantity: 0,
          taxes: [
            { title: "CGST", rate: 0 },
            { title: "SGST", rate: 0 },
            { title: "VAT", rate: 0 },
          ],
        },
      ],
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    const preparedData: Invoice = {
      ...formData,
      items: formData.items.map((item) => ({
        ...item,
        price: parseFloat(item.price.toString()),
        quantity: parseFloat(item.quantity.toString()),
        taxes: item.taxes.map((tax) => ({
          ...tax,
          rate: parseFloat(tax.rate.toString()),
        })),
      })),
    };

    try {
      const response = await axios.post(`${baseUrl}/invoice/new`, preparedData);
      console.log(response);
      if (response.status === 201) {
        setLoading(false);
        navigate("/");
      }
    } catch (e: any) {
      const response = e.response;
      setLoading(false);
      if (response?.status === 400) {
        setErrorMsg("Incomplete/Incorrect credentials");
      }
    }
  }

  function getAvailableTaxOptions(itemIndex: number, taxIndex: number) {
    const selectedTaxes = formData.items[itemIndex].taxes
      .map((tax, idx) => (idx !== taxIndex ? tax.title : null))
      .filter(Boolean);

    const availableTaxes = ["CGST", "SGST", "VAT"].filter(
      (tax) => !selectedTaxes.includes(tax)
    );

    return availableTaxes;
  }

  function calculateSubtotal() {
    return formData.items.reduce(
      (subtotal, item) => subtotal + item.price * item.quantity,
      0
    );
  }
  function calculateTax() {
    return formData.items.reduce((totalTaxes, item) => {
      const itemTotal = item.price * item.quantity;
      const itemTaxes = item.taxes.reduce(
        (taxSum, tax) => taxSum + (tax.rate / 100) * itemTotal,
        0
      );
      return totalTaxes + itemTaxes;
    }, 0);
  }

  const subtotal = calculateSubtotal();
  const totalTaxes = parseFloat(calculateTax().toFixed(2));
  const total = parseFloat((subtotal + totalTaxes).toFixed(2));

  return (
    <>
      <div className={styles.mainContainer}>
        <Header />
        {loading ? (
          <Loader />
        ) : (
          <div className={styles.body}>
            <div className={`${styles["top-part"]}`}>
              <div className={`${styles["label-container"]}`}>
                <label htmlFor="name" className={`${styles.label}`}>
                  Name
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Client Name"
                  name="clientName"
                  id="name"
                  value={formData.clientName}
                  onChange={handleChange}
                />
              </div>
              <div className={`${styles["label-container"]}`}>
                <label htmlFor="date" className={`${styles.label}`}>
                  Date
                </label>
                <input
                  className={styles.input}
                  type="date"
                  placeholder="Date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div className={`${styles["label-container"]}`}>
                <label htmlFor="currency" className={`${styles.label}`}>
                  Currency
                </label>
                <select
                  name="currency"
                  id="currency"
                  className={styles.input}
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <h4>Items</h4>

            <div className={`${styles["item-list"]}`}>
              <hr className={`${styles.hr}`} />
              {formData.items.map((item, index) => (
                <div key={index} className={`${styles["item-list-inputs"]}`}>
                  <div className={`${styles["label-container"]}`}>
                    <label htmlFor="itemName" className={`${styles.label}`}>
                      Item Name
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder={`Item ${index + 1} Name`}
                      name="name"
                      id="itemName"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, e)}
                    />
                  </div>
                  <div className={`${styles["label-container"]}`}>
                    <label htmlFor="quantity" className={`${styles.label}`}>
                      Quantity
                    </label>
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="Quantity"
                      name="quantity"
                      id="quantity"
                      min="0"
                      onWheel={(e) => e.currentTarget.blur()}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                    />
                  </div>
                  <div className={`${styles["label-container"]}`}>
                    <label htmlFor="price" className={`${styles.label}`}>
                      Price
                    </label>
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="Price"
                      name="price"
                      id="price"
                      min="0"
                      onWheel={(e) => e.currentTarget.blur()}
                      value={item.price}
                      onChange={(e) => handleItemChange(index, e)}
                    />
                  </div>
                  {item.taxes.map((tax, taxIndex) => (
                    <div
                      key={taxIndex}
                      className={`${styles["item-list-inputs"]}`}
                    >
                      <div className={`${styles["label-container"]}`}>
                        <label htmlFor="title" className={`${styles.label}`}>
                          Tax title
                        </label>
                        <select
                          className={styles.input}
                          name="title"
                          id="title"
                          value={tax.title}
                          onChange={(e) => handleTaxChange(index, taxIndex, e)}
                        >
                          {getAvailableTaxOptions(index, taxIndex).map(
                            (taxOption) => (
                              <option key={taxOption} value={taxOption}>
                                {taxOption}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div className={`${styles["label-container"]}`}>
                        <label htmlFor="rate" className={`${styles.label}`}>
                          Tax %
                        </label>
                        <input
                          className={styles.input}
                          type="number"
                          id="rate"
                          placeholder={`Tax ${taxIndex + 1} Rate`}
                          min="0"
                          onWheel={(e) => e.currentTarget.blur()}
                          name="rate"
                          value={tax.rate}
                          onChange={(e) => handleTaxChange(index, taxIndex, e)}
                        />
                      </div>
                    </div>
                  ))}
                  <span className={`${styles["label-container"]}`}>
                    {/* empty tag for alignment */}
                    <label htmlFor="btn" className={styles.label}>
                      &nbsp;
                    </label>
                  </span>
                </div>
              ))}
            </div>
            <p onClick={addItem} className={styles.addItemButton}>
              Add Another Item +
            </p>

            {total > 0 ? (
              <div className={styles.calculation}>
                <h3>Total</h3>

                <ul className={styles.ul}>
                  <li className={styles.li}>
                    Subtotal: &nbsp;{" "}
                    {formData.items.map((item, index) => (
                      <span key={`item-${index}`}>
                        ({`${item.price} * ${item.quantity}`})
                        {index < formData.items.length - 1 && " + "}
                      </span>
                    ))}
                    = {currencyIcon(formData?.currency)}
                    {subtotal.toFixed(2)}
                  </li>
                  <li className={styles.li}>
                    Taxes : &nbsp;
                    {formData.items.map((item, index) => (
                      <div
                        key={`item-tax-${index}`}
                        className={`${styles["taxes-list-align"]}`}
                      >
                        {item?.name === "" ? "Item name" : item?.name}: &nbsp;
                        <span>
                          {item.taxes.map((tax, taxIndex) => (
                            <span key={`tax-${index}-${taxIndex}`}>
                              ({tax.rate}% of {item.price * item.quantity})
                              {taxIndex < item.taxes.length - 1 && " + "}
                            </span>
                          ))}
                          = {currencyIcon(formData?.currency)}
                          {item.taxes
                            .reduce(
                              (sum, tax) =>
                                sum +
                                (tax.rate / 100) * item.price * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </li>
                  <li className={styles.li}>
                    Total Taxes:&nbsp; {currencyIcon(formData?.currency)}
                    {totalTaxes.toFixed(2)}
                  </li>
                  <li className={styles.li}>
                    Total:&nbsp; {currencyIcon(formData?.currency)}
                    {total.toFixed(2)}
                  </li>
                </ul>
              </div>
            ) : (
              ""
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              className={`${styles.addTaxButton} ${styles.submitBtn}`}
            >
              Submit
            </button>
            {errorMsg ? <p className={styles.error}>{errorMsg}</p> : ""}
          </div>
        )}
      </div>
    </>
  );
}

export default CreateInvoice;
