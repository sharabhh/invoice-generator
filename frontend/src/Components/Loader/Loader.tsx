import styles from "./Loader.module.css"

function Loader() {
  return (
    <div>
        <div className={`${styles.container}`}>
        <div className={`${styles.ball}`}></div>
        <div className={`${styles.ball}`}></div>
        <div className={`${styles.ball}`}></div>
        <div className={`${styles.ball}`}></div>
        <div className={`${styles.ball}`}></div>
    </div>
    </div>
  )
}

export default Loader