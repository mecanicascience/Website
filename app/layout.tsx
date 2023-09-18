import type { Metadata } from 'next'
import styles from './layout.module.css'
import { raleway } from './fonts'

export const metadata: Metadata = {
    title: 'MecanicaScience',
    description: 'Physics by Simulation',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={raleway.className}>
            <head>
                <link rel="icon" type="image/ico" href="/images/favicon.ico" />
            </head>

            <body className={styles.body}>{children}</body>
        </html>
    )
}
