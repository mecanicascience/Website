'use client'

import Header from './home/header/header'
import styles from './error.module.css'
import { LinkButton } from './ui/buttons/button'

export default function NotFound() {
    return (
        <Header>
            <div className={styles.content}>
                <p>Oops! This page wasn&apos;t found.</p>
            </div>

            <div className={styles.buttons}>
                <LinkButton content='Go Home' link='/' />
            </div>
        </Header>
    )
}