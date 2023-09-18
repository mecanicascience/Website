'use client'

import styles from './header.module.css';
import Image from 'next/image';
import logo from '../../public/images/logo.png';
import { montserrat } from '../layout';

/**
 * Header component
 * @param props
 * @param props.children Children
 */
export default function Header(props: { children?: React.ReactNode }) {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.content + ' ' + montserrat}>
                    <div className={styles.logo}>
                        <Image src={logo} alt="MecanicaScience logo" height={350} priority />
                    </div>
                    
                    <div className={styles.text}>
                        <div className={styles.subtitle}>
                            <p className={styles.subtitleUp}>Physics by</p>
                            <p className={styles.subtitleDown}>simulation</p>
                        </div>

                        <div className={styles.title}>
                            <p className={styles.titleUp}>Mecanica</p>
                            <p className={styles.titleDown}>Science</p>
                        </div>
                    </div>
                </div>

                { props.children }
            </div>
        </header>
    )
}
