import styles from '../styles/career.module.scss'
import React from "react";
import Link from "next/link";
import Header from "../components/header"
import SectionHeader from "../components/careerHeader"
import CareerData from "../components/career"

export default function career() {
  return (
    <div className={styles.page}>
        <Header />
        <SectionHeader />
        <CareerData />
    </div>
  )
}