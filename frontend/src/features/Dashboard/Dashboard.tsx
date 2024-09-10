import Header from "../../Components/Header/Header";
import styles from "./Dashboard.module.css";
import { IoFilterOutline } from "react-icons/io5";
import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../config";

function Dashboard() {
  const [allRecords, setAllRecords] = useState([]);
  useEffect(() => {
    async function fetchAllRecords() {
      const response = await axios.get(`${baseUrl}/invoice/all-records`);
      setAllRecords(response?.data?.data);
    }
    fetchAllRecords();
  }, []);
  console.log(allRecords);

  return (
    <>
      <Header />
      <div className={`${styles.container}`}>
        <div className={`${styles["outer-container"]}`}>
          <div className={`${styles["dashboard-heading"]}`}>
            <h3>Invoices</h3>
            <div>
              <input className={`${styles["search-box"]}`} type="text" />
              <span className={`${styles["empty-span"]}`}>
                <IoFilterOutline />
              </span>
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
            {allRecords?.length >= 1
              ? allRecords.map((item: any) => (
                  <div
                    key={item.id}
                    className={`${styles["dashboard-table-tabs"]}`}
                  >
                    <p className={`${styles["small-p"]}`}>
                      #{item?.invoiceNumber}
                    </p>
                    <p className={`${styles["small-p"]}`}>{item?.clientName}</p>
                    <p className={`${styles["small-p"]}`}>{item?.date}</p>
                    <p className={`${styles["small-p"]}`}>{item?.currency}</p>
                    <p className={`${styles["small-p"]}`}>{item?.total}</p>
                  </div>
                ))
              : ""}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
