'use client'

import { forwardRef } from 'react'
import styles from './navbar.module.css'

const MenuButton = forwardRef<HTMLButtonElement, { open: boolean; label: string; onClick: () => void }>(function MenuButton({ open, label, onClick }, ref) {
  return (
    <button ref={ref} type="button" className={styles.menuButton} onClick={onClick} aria-label={label} aria-expanded={open} aria-controls="site-navigation">
      <span className={styles.menuGlyph} aria-hidden="true"><span/><span/><span/></span>
    </button>
  )
})

export default MenuButton
