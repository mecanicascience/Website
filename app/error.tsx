'use client'

import { useEffect } from 'react'
import Header from './header/header'
import styles from './error.module.css'
import { ClickButton, LinkButton } from './ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    useEffect(() => {
        // Log the error
        console.error(error)
    }, [error])

    return (
        <Header>
            <div className={styles.content}>
                <p>Something went wrong!</p>
            </div>

            <div className={styles.buttons}>
                <LinkButton content='Go Home' link='/' />
                <span style={{ display: 'inline', marginLeft: '40px' }} />
                <ClickButton content='Try again' action={() => reset()} />
            </div>
        </Header>
    )
}