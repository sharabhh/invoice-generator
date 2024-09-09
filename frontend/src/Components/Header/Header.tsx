import React from 'react'
import styles from './Header.module.css'

function Header() {
  return (
    <>
    <div className={`${styles['header-container']}`}>
        <h2 className={`${styles['header-heading']}`}>INVOICE GENERATOR</h2>
    </div>
    </>
  )
}

export default Header