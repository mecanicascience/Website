import Link from 'next/link'
import Image from 'next/image'
import styles from './navbar.module.css'

export default function Navbar() {
    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.navbar}>
                    <div className={styles.logo}>
                        <Link href="/">
                            <Image src='/images/logo.png' alt="MecanicaScience logo" height={50} width={50} priority />
                        </Link>
                        <Link href="/" className={styles.mecanicascience}>
                            <p>MecanicaScience</p>
                        </Link>
                    </div>

                    <div className={styles.links}>
                        <Link href="/articles">
                            <p>Articles</p>
                        </Link>
                        <Link href="/simulations">
                            <p>Simulations</p>
                        </Link>
                        <Link href="/about">
                            <p>About</p>
                        </Link>
                    </div>
                </div>

                <div className={styles.navbarBackground}>
                </div>
            </nav>
        </>
    )
}