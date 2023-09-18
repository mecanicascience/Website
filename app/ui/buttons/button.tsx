'use client'

import Link from 'next/link';
import styles from './button.module.css';

/**
 * Button component
 * @param props
 * @param props.content Text content of the button
 * @param props.link Link to redirect to
 * @param props.action Action to execute when the button is clicked
 * @param props.padding Padding between the icon and the text (default: 0)
 */
function Button(props: { content: string, link?: string, action?: any, padding?: string }) {
    const core = <div className={styles.content}>
        <span className={styles.circle} aria-hidden="true">
            <span className={styles.icon + " " + styles.arrow}></span>
        </span>
        <span className={styles["button-text"]}>
            {props.padding && <span style={{ display: 'inline', marginLeft: props.padding + 'px' }} />}
            {props.content}
        </span>
    </div>

    return (<>
        {props.link && <Link href={props.link} className={styles.container}>
            {core}
        </Link>}
        {props.action && <div onClick={props.action} className={styles.container}>
            {core}
        </div>}
    </>)
}

/**
 * Button component with a link
 * @param props
 * @param props.content Text content of the button
 * @param props.link Link to redirect to
 * @param props.padding Padding between the icon and the text (default: 0)
 */
export function LinkButton(props: { content: string, link: string, padding?: string }) {
    return <Button content={props.content} link={props.link} padding={props.padding} />
}

/**
 * Button component with an action
 * @param props
 * @param props.content Text content of the button
 * @param props.action Action to execute when the button is clicked
 * @param props.padding Padding between the icon and the text (default: 0)
 */
export function ClickButton(props: { content: string, action: any, padding?: string }) {
    return <Button content={props.content} action={props.action} padding={props.padding} />
}
