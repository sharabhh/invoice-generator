import Header from "../../Components/Header/Header";
import styles from "./Dashboard.module.css";
import { IoFilterOutline } from "react-icons/io5";
import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../config";
import DashMiniMenu from "../../Components/DashMiniMenu/DashMiniMenu";
import currencyIcon from "../../utils/currencyIcon";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";

function Dashboard() {
  const [allRecords, setAllRecords] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const [currentActiveId, setCurrentActiveId]: any = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [loading, setLoading] = useState(true);

  function handleShowOptions(
    id: string,
    invoiceId: string,
    e: React.MouseEvent<HTMLDivElement>
  ) {
    e.stopPropagation();
    setSelectedInvoiceId(id === selectedInvoiceId ? null : id);
    setCurrentActiveId(id);
    setInvoiceNumber(invoiceId);
    console.log(invoiceId);
  }

  // console.log(currentActiveId);

  function handleInvoiceId(invoice: string) {
    setInvoiceNumber(invoice);
  }
  function handleViewInvoiceRedirect(invoiceRedirectId: string) {
    navigate(`/invoice/${invoiceRedirectId}`);
  }

  useEffect(() => {
    async function fetchAllRecords() {
      const response = await axios.get(`${baseUrl}/invoice/all-records`);
      setAllRecords(response?.data?.data);
      setLoading(false);
    }
    fetchAllRecords();
  }, []);

  function handleRedirectNewInvoice() {
    navigate("/new-invoice");
  }

  return (
    <>
      <Header />
      <div className={`${styles.container}`}>
        <div className={`${styles["outer-container"]}`}>
          <div className={`${styles["dashboard-heading"]}`}>
            <h3>Invoices</h3>
            <div>
              {/* "empty div for alignment" */}
            </div>
          </div>

          <div className={`${styles.dashboard}`}>
            <div className={`${styles["dashboard-table-heading"]}`}>
              <p className={`${styles["dashboard-table-heading-p"]}`}>
                Invoice number
              </p>
              <p className={`${styles["dashboard-table-heading-p"]}`}>
                Customer Name
              </p>
              <p className={`${styles["dashboard-table-heading-p"]}`}>Date</p>
              <p className={`${styles["dashboard-table-heading-p"]}`}>
                Currency
              </p>
              <p className={`${styles["dashboard-table-heading-p"]}`}>Amount</p>
            </div>
            {allRecords?.length >= 1 && !loading ? (
              allRecords.map((item: any) => (
                <div
                  key={item.id}
                  className={`${styles["dashboard-table-tabs"]}`}
                  onClick={() => handleInvoiceId(item?.invoiceNumber)}
                >
                  <div
                    className=""
                    onClick={() =>
                      handleViewInvoiceRedirect(item?.invoiceNumber)
                    }
                  >
                    <p className={`${styles["small-p"]}`}>
                      #{item?.invoiceNumber}
                    </p>
                  </div>
                  <p className={`${styles["small-p"]}`}>{item?.clientName}</p>
                  <p className={`${styles["small-p"]}`}>{item?.date}</p>
                  <p className={`${styles["small-p"]}`}>{item?.currency}</p>
                  <div className={`${styles["amount-button-container"]}`}>
                    <p className={`${styles["small-p"]}`}>
                      {currencyIcon(item?.currency)}
                      {item?.total}
                    </p>
                    <div
                      className={`${styles.dot}`}
                      onClick={(e) =>
                        handleShowOptions(item?.id, item?.invoiceNumber, e)
                      }
                    >
                      <p>...</p>
                    </div>
                    {selectedInvoiceId === item?.id && (
                      <DashMiniMenu invoiceId={invoiceNumber} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Loader />
            )}
          </div>
        </div>
        <div className={`${styles.add}`} onClick={handleRedirectNewInvoice}>
          +
        </div>
      </div>
    </>
  );
}

export default Dashboard;
