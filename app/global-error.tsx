'use client'

import { useEffect } from "react"
import Header from "./home/header/header";
import styles from './error.module.css'
import { ClickButton, LinkButton } from "./ui/buttons/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    useEffect(() => {
        // Log the error
        console.error(error);
    }, [error])

    return (
        <html>
            <head>
                <title>Something went wrong!</title>
                <link rel="icon" type="image/ico" href="/images/favicon.ico" />
            </head>

            <body>
                <Header>
                    <div className={styles.content}>
                        <p>Something went wrong!</p>
                    </div>

                    <div className={styles.buttons}>
                        <LinkButton content='Go Home' link='/' size='standard' />
                        <span style={{ display: 'inline', marginLeft: '40px' }} />
                        <ClickButton content='Try again' action={() => reset()} size='standard' />
                    </div>
                </Header>
            </body>
        </html>
    )
}