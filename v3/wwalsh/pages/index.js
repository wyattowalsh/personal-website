import styles from '../styles/index.module.scss'
import React from "react";
import Landing from "../components/landing"
import Link from 'next/link'
import { Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithubAlt, faLinkedinIn, faTwitter, faKaggle, faMediumM } from '@fortawesome/free-brands-svg-icons'

export default function index() {
  return (
  <div className={styles.home}>
    <Landing />
    <div className={styles.container}>
      <div className={styles.greeting}>
        <div><h1>Hey 👋</h1></div>
        <div><h2>Welcome to my page!</h2></div>
      </div>
      <div className={styles.nav}>
        <Link href="/interests">
            <a>
              <Button variant="contained" endIcon="🤔" className={styles.interests}>
                Interests
              </Button>
            </a>
        </Link>
        <Link href="/projects">
            <a>
              <Button variant="contained" endIcon="🧑‍🏭" className={styles.projects}>
                Projects
              </Button>
            </a>
        </Link>
        <Link href="/career">
            <a>
              <Button variant="contained" endIcon="🤝" className={styles.career}>
                Career
              </Button>
            </a>
        </Link>
        <Link href="/more">
            <a>
              <Button variant="contained" endIcon="🤷‍♂️" className={styles.more}>
                More
              </Button>
            </a>
        </Link>
      </div>
      <div className={styles.socials}>
        <Link href="https://www.github.com/wyattowalsh">
            <a>
              <Button variant="contained" className={styles.gh}>
                <div className={styles.social}>
                  <FontAwesomeIcon icon={faGithubAlt} className={styles.github}/>
                  <span>GitHub</span>
                </div>
              </Button>
            </a>
        </Link>
        <Link href="https://www.linkedin.com/in/wyattowalsh">
            <a>
              <Button variant="contained" className={styles.li}>
                <div className={styles.social}>
                  <FontAwesomeIcon icon={faLinkedinIn} className={styles.linkedin}/>
                  <span>LinkedIn</span>
                </div>
              </Button>
            </a>
        </Link>
        <Link href="https://www.twitter.com/wyattowalsh">
            <a>
              <Button variant="contained" className={styles.tw}>
                <div className={styles.social}>
                  <FontAwesomeIcon icon={faTwitter} className={styles.twitter}/>
                  <span>Twitter</span>
                </div>
              </Button>
            </a>
        </Link>
        <Link href="https://www.kaggle.com/wyattowalsh">
            <a>
              <Button variant="contained" className={styles.kg}>
                <div className={styles.social}>
                  <FontAwesomeIcon icon={faKaggle} className={styles.kaggle}/>
                  <span>Kaggle</span>
                </div>
              </Button>
            </a>
        </Link>
        <Link href="https://www.medium.com/@wyattowalsh">
            <a>
              <Button variant="contained" className={styles.md}>
                <div className={styles.social}>
                  <FontAwesomeIcon icon={faMediumM} className={styles.medium}/>
                  <span>Medium</span>
                </div>
              </Button>
            </a>
        </Link>
      </div>
    </div>
  </div>
  )
}