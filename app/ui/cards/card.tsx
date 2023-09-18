import Image from 'next/image'
import styles from './card.module.css'
import { raleway, montserrat } from '../../fonts';
import Link from 'next/link';

/**
 * Card component
 * @param props 
 * @param props.alignText 'right' | 'left' aligns the text on the right or on the left
 * @param props.title Title of the card
 * @param props.description Description of the card
 * @param props.image Image of the card
 * @param props.link Link of the card
 * @param props.keyword Keyword of the card
 * @param props.year Year of the card
 * @param props.color Color of the title
 */
export default function Card(props: {
    alignText: 'right' | 'left', title: string, description: string, image: string, link: string, keyword: string, year: string, color: string
}) {
    const image = <div className={styles.image}>
        <Image src={props.image} alt={props.title + ' illustration'} width={400} height={400} onClick={() => window.location.replace(props.link)} />
    </div>;

    const content = <div className={styles.text + ' ' + (props.alignText == 'right' ? styles.textRight : styles.textLeft)}>
        <div className={styles.title + ' ' + montserrat}>
            <Link href={props.link} style={{ color: props.color }}>{props.title}</Link>
        </div>
        <div className={styles.description}>
            <p className={styles.descriptionText}>{props.description}</p>
            <p className={styles.label + ' ' + raleway}>{props.year} • {props.keyword}</p>
        </div>
    </div>;

    return (
        <div className={styles.card}>
            {props.alignText == 'right' ? image : content}
            {props.alignText == 'right' ? content : image}
        </div>
    )
}