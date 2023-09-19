'use client'

import Header from './home/header/header'
import { ClickButton, LinkButton } from './ui/buttons/button'
import styles from './page.module.css'
import HeaderAnimation from './home/header/animation'
import ArticlesList from './home/articles/articles'
import SimulationsList from './home/simulations/simulations'
import Footer from './home/footer/footer'

export default function Home() {
    return (
        <>
            <HeaderAnimation />

            <Header style={{height: '115vh'}} showScrollButton>
                <div className={styles.buttons}>
                    <ClickButton content='Articles' action={() => {window.scrollTo({
                        top: document.getElementById('articles')?.offsetTop, behavior: 'smooth'
                    })}} size='standard' />
                    <ClickButton content='Simulations' action={() => {
                        window.scrollTo({
                            top: document.getElementById('simulations')?.offsetTop, behavior: 'smooth'
                        })
                    }} padding='25' size='standard' />
                    <LinkButton content='About me' link='/about' size='standard' />
                </div>
            </Header>

            <ArticlesList />
            <SimulationsList />

            <Footer />
        </>
    )
}
