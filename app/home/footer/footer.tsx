import Link from 'next/link'
import styles from './footer.module.css'
import Image from 'next/image'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.transition}></div>

            <div className={styles.content}>
                <div className={styles.footerContent}>
                    <div className={styles.icons}>
                        <Link href="https://twitter.com/MecanicaSci" className={styles.twitter}>
                            <Image
                                src="/icons/twitter.svg"
                                alt="Twitter of MecanicaScience"
                                width={30}
                                height={30} />
                        </Link>

                        <Link href="https://github.com/mecanicascience/" className={styles.github}>
                            <Image
                                src="/icons/github.svg"
                                alt="Github of MecanicaScience"
                                width={30}
                                height={30} />
                        </Link>

                        <Link href="https://www.youtube.com/c/Mecanicascience" className={styles.youtube}>
                            <Image
                                src="/icons/youtube.svg"
                                alt="Youtube channel of MecanicaScience"
                                width={37}
                                height={37} />
                        </Link>
                    </div>
                    
                    <div className={styles.endText}>
                        <p>©{new Date().getFullYear()} MecanicaScience</p>
                        <p className={styles.separator}>|</p>
                        <p><a href="mailto:mecanicascience@gmail.com">mecanicascience@gmail.com</a></p>
                        <p className={styles.separator}>|</p>
                        <p>Version 5.0</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}