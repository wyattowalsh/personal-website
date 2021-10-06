import styles from './resume.module.scss'
import Link from 'next/link'
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function Resume() {
  return (
    <div className={styles.resume}>
        <div className={styles.container}>
            <div className={styles.share}>
                Hello! <span className="wave">👋</span>
            </div>
            <div className={styles.resumeButton}>
              <Link href="/resume.pdf">
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                  <Button variant="contained" color='primary' endIcon={<OpenInNewIcon />}>
                        View my résumé
                  </Button>
                </a>
              </Link>
            </div>
        </div>
    </div>
  )
}