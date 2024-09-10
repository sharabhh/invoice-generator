import styles from './DashMiniMenu.module.css'

function DashMiniMenu() {
  
  return (
    <>
  <div className={`${styles.container}`}>
    <ul className={`${styles.ul}`}>
        <a href='#' className={`${styles.a}`}><li className={`${styles.li}`}>Edit</li></a>
        <a href='#' className={`${styles.a}`}><li className={`${styles.li}`}>View</li></a>
        <a href='#' className={`${styles.a}`}><li className={`${styles.li}`}>Share</li></a>
        <a href='#' className={`${styles.a}`}><li className={`${styles.li}`}>Delete</li></a>
    </ul>
  </div>
    </>
  )
}

export default DashMiniMenu