import styles from './Landing.module.scss'
import React from "react";
import Button from '@mui/material/Button';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Link from "next/link";

export default function Landing() {
  return (
    <div className={styles.landing}>
        <div className={styles.container}>
            <h1>Hey there 👋</h1>
            <Link href="/contents">
                <a>
                    <Button variant="contained" startIcon={<ArrowDownwardIcon />} endIcon={<ArrowDownwardIcon />} size='large'>Enter Site</Button>
                </a>
            </Link>
        </div>
    </div>
  )
}