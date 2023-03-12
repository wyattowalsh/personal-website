import FileDownloadIcon from '@mui/icons-material/FileDownload'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Head from 'next/head'
import Image from 'next/image'
import * as React from 'react'
import Layout from '../components/layouts/base'
import Avatar from '../public/img/avatar.webp'
import styles from './index.module.scss'

function Home() {
  return (
    <Box
      className={styles.box}
      sx={{
        flexDirection: { xs: 'column', md: 'row' },
        justifyItems: { xs: 'center', md: 'space-between' },
        alignItems: { xs: 'center', md: 'flex-start' },
      }}
    >
      <Box className={styles.left}>
        <Tooltip
          title="Click here to visit my LinkedIn profile"
          arrow
          placement="top"
        >
          <a
            href="https://www.linkedin.com/in/wyattowalsh"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <Box className={styles.avatar}>
              <Image
                src={Avatar}
                alt="Personal Avatar"
                width={250}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
                quality={100}
              />
            </Box>
          </a>
        </Tooltip>
        <Box className={styles.Download}>
          <Tooltip title="Download a .PDF copy of my current resume" arrow>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              <Button
                variant="contained"
                endIcon={<FileDownloadIcon />}
                size="large"
                color="secondary"
                className={styles.buttonDownload}
              >
                Download Resume
              </Button>
            </a>
          </Tooltip>
        </Box>
      </Box>
      <Box
        className={styles.about}
        sx={{ maxWidth: { xs: '100%', md: '60%' } }}
      >
        {/* <Typography variant="h1" className={styles.mainHeading}>
          About Me
        </Typography> */}
        <br />
        <Typography variant="h5" sx={{ fontWeight: '700' }}>
          Hey there! <span className={styles.wave}>👋</span>
        </Typography>
        <br />
        <Typography
          variant="h6"
          sx={{ fontWeight: '700', alignItems: 'center' }}
        >
          My name is <span className={styles.name}>Wyatt Walsh</span>.
        </Typography>
        <br />
        <Typography variant="body1">
          I am a curious engineer, developer, and scientist with manifold
          interests, a robust skill set, and impact-driven motivations.
        </Typography>
        <br />
        <Typography variant="body1">
          Growing up in the rural Eastern Sierras of California, I attended The
          Hotchkiss School, a boarding school in Northwest Connecticut, during
          the last two years of high school to gain access to better resources
          in science, technology, engineering, and mathematics. I then went on
          to the University of California, Berkeley, where I initially pursued a
          joint major program between the Bioengineering and Materials Science
          Departments with a focus on tissue engineering.
        </Typography>
        <br />
        <Typography variant="body1">
          However, I eventually changed majors to Industrial Engineering and
          Operations Research (IEOR) and focused on mathematical optimization
          theory. I took a variety of theoretical and applied optimization
          courses, gaining an appreciation for this powerful lens to view the
          world. This knowledge became the foundation for my exploration of data
          science, machine learning, computer science, and mechanical
          engineering. I was also on course staff for the Data 8: Foundations of
          Data Science course, helping to teach others.
        </Typography>
        <br />
        <Typography variant="body1">
          After graduating from Berkeley, I further honed my skills in data
          engineering and front-end software engineering. I then pursued
          entrepreneurial endeavors, launching a personal project (SandLabs) and
          partnering with two Duke students. My work with the Duke students
          revolved around creating marketing data dashboards for Web3 companies
          and DAO tooling and operation.
        </Typography>
        <br />
        <Typography variant="body1">
          Most recently, I was a senior software engineer at an early-stage
          decentralized finance (DeFi) company that provided collateralized
          loans using non-fungible tokens (NFTs). My responsibilities included
          mentoring two junior developers, managing the team using Agile
          development principles and Jira, ensuring application integrations,
          and enabling responsive design and state management.
        </Typography>
        <br />
        <Typography variant="body1">
          I am enthusiastic to become a part of an organization where I can
          utilize my skills to make a significant contribution and tackle
          complex issues. Working in such an organization would be a great
          opportunity to further my development and to help better the lives of
          others. I am confident that my set of skills, including
          problem-solving, communication, and leadership, would be a great asset
          to the team. I am excited to be part of something bigger and to be
          able to use my skills to make a difference.
        </Typography>
      </Box>
    </Box>
  )
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Wyatt Walsh&apos;s Personal Website | Home</title>
        <meta
          name="description"
          content="Welcome to my personal website, which hosts my projects, blog, and notes."
        />
        <meta
          property="og:description"
          content="Welcome to my personal website, which hosts my projects, blog, and notes."
        />
        <meta property="og:image" content="/img/logo.webp" />
        <meta property="og:title" content="Wyatt Walsh's Personal Website" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.w4w.dev" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@wyattowalsh" />
        <meta name="twitter:image" content="/img/logo.webp" />
        <meta name="twitter:title" content="Wyatt Walsh's Personal Website" />
        <meta name="twitter:url" content="https://www.w4w.dev" />
        <link rel="icon" href="/favicon/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout>
        <main>{page}</main>
      </Layout>
    </>
  )
}

export default Home
