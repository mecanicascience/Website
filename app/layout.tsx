import type { Metadata } from 'next'
import styles from './layout.module.css'
import { Montserrat, Raleway } from 'next/font/google'

export const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    weight: ['300', '800']
})

export const raleway = Raleway({
    subsets: ['latin'],
    display: 'swap',
    weight: ['300', '800']
})

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
            <body className={styles.body}>{children}</body>
        </html>
    )
}
