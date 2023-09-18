'use client'

import styles from './header.module.css';
import Image from 'next/image';
import { montserrat } from '../../fonts';
import ButtonScroll from '../../ui/buttons/button-scroll';

/**
 * Header component
 * @param props
 * @param props.children Children
 * @param props.style Style
 * @param props.showScrollButton Show scroll button or not
 */
export default function Header(props: { children?: React.ReactNode, style?: React.CSSProperties, showScrollButton?: boolean }) {
    return (
        <header className={styles.header} style={props.style}>
            <div className={styles.container}>
                <div className={styles.content + ' ' + montserrat}>
                    <div className={styles.logo}>
                        <Image src='/images/logo.png' alt="MecanicaScience logo" height={350} width={350} priority />
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

                { props.showScrollButton && <ButtonScroll scrollId='articles' /> }
            </div>
        </header>
    )
}
