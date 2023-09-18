'use client'

import { useEffect } from "react"
import Header from "./header/header";
import styles from './error.module.css'
import { ClickButton, LinkButton } from "./ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    useEffect(() => {
        // Log the error
        console.error(error);
    }, [error])

    return (
        <html>
            <body>
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
            </body>
        </html>
    )
}