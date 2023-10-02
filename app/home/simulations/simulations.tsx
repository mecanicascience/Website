'use client'

import styles from './simulations.module.css'
import { raleway } from '../../fonts';
import Card from '../../ui/cards/card'
import { LinkButton } from '../../ui/buttons/button'

const allSimulations = [
    {
        title: 'Heat equation',
        description: 'The heat equation describes the temperature evolution inside materials. Using the latest GPU technologies, this simulations aim to compute this propagation considering some obstacles.',
        image: 'https://firebasestorage.googleapis.com/v0/b/mecanicascience.appspot.com/o/simulations%2F10_thermal_conduction.png?alt=media',
        link: '/simulations/heat_equation',
        keyword: 'Thermodynamics',
        year: '2022'
    },
    {
        title: 'Ising model',
        description: 'The <c>Ising model</c> is a model from Statistical Physics modelling magnetism inside materials. In this simulation, GPU is used to simulate this model in real time, using the Metropolis Algorithm.',
        image: 'https://firebasestorage.googleapis.com/v0/b/mecanicascience.appspot.com/o/simulations%2F9_modele_ising.png?alt=media',
        link: '/simulations/ising_model',
        keyword: 'Statistical Physics',
        year: '2022'
    },
    {
        title: 'Hydrogen atom',
        description: 'This simulation uses the latest GPU tools to view the orbitals wavefunctions of an Hydrogen Atom. The quantum numbers can be modified in real time.',
        image: 'https://firebasestorage.googleapis.com/v0/b/mecanicascience.appspot.com/o/simulations%2F7_hydrogen_atom.png?alt=media',
        link: '/simulations/hydrogen_atom',
        keyword: 'Quantum Mechanics',
        year: '2022'
    },
    {
        title: 'Electrostatic Field',
        description: 'This project shows the electrostatic line fields beeing computed in real time. It computes and shows the field lines for entirely customizable sources.',
        image: 'https://firebasestorage.googleapis.com/v0/b/mecanicascience.appspot.com/o/simulations%2F2_champ_electrique.png?alt=media',
        link: '/simulations/electrostatic_field',
        keyword: 'Electromagnetism',
        year: '2021'
    }
];

export default function SimulationsList(props: { count?: number, inverted?: boolean }) {
    // Get list of articles
    const simulations = props.count ? allSimulations.slice(0, props.count) : allSimulations;
    const moreButton = props.count ? true : false;

    // Create cards
    const inverted = props.inverted ?? false;
    const cards = simulations.map((article, index) => {
        const formatDescription = article.description.replace(/<c>(.*?)<\/c>/g, '<span class="colorNote">$1</span>');
        return (
            <Card
                alignText={index % 2 == 0 ? 'right' : 'left'}
                title={article.title}
                description={formatDescription}
                image={article.image}
                link={article.link}
                keyword={article.keyword}
                year={article.year}
                color={inverted ? "#21365b" : "#eee"}
                key={index} />
        )
    });

    return (
        <section id="simulations" className={inverted ? '' : styles.simulations}>
            <div className={styles.transition + ' ' + (inverted ? styles.transitionLight : styles.transitionDark) + ' ' + (inverted ? styles.rotationLow : styles.rotationHigh)}></div>

            <div className={styles.animationsContainer + ' ' + (inverted ? styles.animationsContainerLight : styles.animationsContainerDark)}>
                <div className={styles.animations}>
                    <div className={styles.title + ' ' + raleway + ' ' + (inverted ? styles.titleLight : styles.titleDark)}>
                        <p>{ inverted ? "Interactive Simulations" : "Latest Simulations" }</p>
                    </div>

                    <div className={styles.content}>
                        { cards }
                    </div>

                    <div className={styles.more}>
                        { moreButton && <LinkButton content='All Simulations' link='/simulations' padding='24' size='large' /> }
                    </div>
                </div>
            </div>
        </section>
    )
}