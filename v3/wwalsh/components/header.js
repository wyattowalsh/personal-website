import styles from './header.module.scss'
import React from "react";
import Link from "next/link";
import { Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

export default function header() {
  return (
    <nav className={styles.nav}>
        <div className={styles.container}>
          <div>
            <Link href="/">
              <a>
                <Button variant="contained" className={styles.navLink}>
                  <div className={styles.navLinks}>
                    <div><FontAwesomeIcon icon={faHome} className={styles.home}/></div>
                    <div className={styles.names}><span className={styles.name}>Wyatt</span><span className={styles.name}>Walsh</span></div>
                  </div>
                </Button>
              </a>
            </Link>
          </div>
          <div className={styles.sections}>
            <Link href="/interests">
              <a>
                <Button variant="contained" className={styles.interests}>
                  Interests &nbsp;<span className={styles.icons}>🤔</span>
                </Button>
              </a>
            </Link>
            <Link href="/projects">
              <a>
                <Button variant="contained" className={styles.projects}>
                  Projects &nbsp;<span className={styles.icons}>🧑‍🏭</span>
                </Button>
              </a>
            </Link>
            <Link href="/career">
                <a>
                  <Button variant="contained" className={styles.career}>
                    Career &nbsp;<span className={styles.icons}>🤝</span>
                  </Button>
                </a>
            </Link>
            <Link href="/more">
                <a>
                  <Button variant="contained" className={styles.more}>
                    More &nbsp;<span className={styles.icons}>🤷‍♂️</span>
                  </Button>
                </a>
            </Link>
          </div>
        </div>
    </nav>
  )
}
