'use client'

import Header from './header/header'
import { LinkButton } from './ui/button'
import styles from './page.module.css'
import HeaderAnimation from './header/animation'

export default function Home() {
    return (
        <>
            <HeaderAnimation />

            <Header>
                <div className={styles.buttons}>
                    <LinkButton content='Articles' link='/articles' />
                    <LinkButton content='Simulations' link='/simulations' padding='25' />
                    <LinkButton content='About me' link='/about' />
                </div>
            </Header>
        </>
    )
}
