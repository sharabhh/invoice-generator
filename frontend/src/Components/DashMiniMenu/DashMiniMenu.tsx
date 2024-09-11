import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseUrl, { frontendUrl } from "../../config";
import copyToClipboard from "../../utils/copyToClipboard";
import styles from "./DashMiniMenu.module.css";

function DashMiniMenu({ invoiceId }: any) {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleRedirectView() {
    navigate(`/invoice/${invoiceId}`);
  }

  function handleRedirectEdit() {
    navigate(`/edit-invoice/${invoiceId}`);
  }

  async function handleDelete() {
    try {
      const response = await axios.delete(
        `${baseUrl}/invoice/delete-invoice/${invoiceId}`
      );
      if (response.status === 200) {
        navigate("/");
      }
    } catch (e: any) {
      const response = e.response;
      if (response?.status === 404) {
        alert("Already deleted or doesn't exist");
      } else {
        alert('Server error');
      }
    }
  }

  function handleShare() {
    copyToClipboard(`${frontendUrl}/invoice/${invoiceId}`);
    setToastMessage("Link copied to clipboard!");

    setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Hide after 3 seconds
  }

  return (
    <>
      <div className={`${styles.container}`}>
        <ul className={`${styles.ul}`}>
          <a className={`${styles.a}`} onClick={handleRedirectEdit}>
            <li className={`${styles.li}`}>Edit</li>
          </a>
          <a className={`${styles.a}`} onClick={handleRedirectView}>
            <li className={`${styles.li}`}>View</li>
          </a>
          <a className={`${styles.a}`} onClick={handleShare}>
            <li className={`${styles.li}`}>Share</li>
          </a>
          <a className={`${styles.a}`} onClick={handleDelete}>
            <li className={`${styles.li}`}>Delete</li>
          </a>
        </ul>
      </div>
      {toastMessage && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}
    </>
  );
}

export default DashMiniMenu;
