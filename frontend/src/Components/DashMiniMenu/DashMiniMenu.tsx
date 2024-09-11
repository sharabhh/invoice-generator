import axios from 'axios';
import styles from './DashMiniMenu.module.css'
import { useNavigate } from 'react-router-dom'
import baseUrl from '../../config';

function DashMiniMenu({invoiceId}: any) {
  console.log(invoiceId);
  
  const navigate = useNavigate()

  function handleRedirectView(){
    navigate(`/invoice/${invoiceId}`)
  }
  function handleRedirectEdit(){

  }
  async function handleDelete(){
    try{
      const response = await axios.delete(`${baseUrl}/invoice/delete-invoice/${invoiceId}`)
      if(response.status === 200){
        navigate('/')
      }
    } catch(e){
  console.log(e);

    }
  }

  return (
    <>
  <div className={`${styles.container}`}>
    <ul className={`${styles.ul}`}>
        <a href='#' className={`${styles.a}`}><li className={`${styles.li}`}>Edit</li></a>
        <a className={`${styles.a}`} onClick={handleRedirectView}><li className={`${styles.li}`}>View</li></a>
        <a href='#' className={`${styles.a}`}><li className={`${styles.li}`}>Share</li></a>
        <a className={`${styles.a}`} onClick={handleDelete}><li className={`${styles.li}`}>Delete</li></a>
    </ul>
  </div>
    </>
  )
}

export default DashMiniMenu