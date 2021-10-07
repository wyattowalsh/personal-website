import styles from './careerHeader.module.scss'


export default function SectionHeader () {
    return (
        <div className={styles.body}>
            <div className={styles.landing}>
                <h1 className={styles.career}>
                    Career <span className={styles.icons}>💼</span>
                </h1>
                <h2 className={styles.tag}>Workin' to the beat of the drum</h2>
            </div>
        </div>
    )
}