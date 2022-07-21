import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Dark.module.css'
// import styles from '../styles/Home.module.css'
import { updateCount } from '../services/CounterService'
import { useEffect, useState } from 'react'

const Home: NextPage = () => {
  const [count, setCount] = useState('')

  useEffect(() => {
    const counter = async () => setCount(await updateCount())
    counter()
  }, [])

  if (count) console.log(count)
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Clay Danford</title>
      </Head>

      <main className={styles.main}>
        <img
          src="/avatar.jpg"
          width={250}
          height={250}
          className={styles.avatar}
          alt="Clay Danford"
        />
        <h1 className={styles.title}>Clay Danford</h1>

        <p className={styles.description}>
          Cloud Transformation Leader, Principal Cloud Architect,
          <br></br>Conference Speaker, AWS Community Builder
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Change Agent</h2>
            <p>
              Challenger to all things status quo, effectively leads enterprise
              level transformation and business enablement.
            </p>
          </div>
          <div className={styles.card}>
            <h2>Cloud First</h2>
            <p>
              AWS Solutions Architect Professional, AWS DevOps Professional,
              with experience in both public and private cloud.
            </p>
          </div>
          <div className={styles.card}>
            <h2>Mentorship</h2>
            <p>
              A passion for leading technical teams, lifting others up, and
              using cloud technology to do it.
            </p>
          </div>
          <div className={styles.card}>
            <h2>Application Architecture</h2>
            <p>
              Expertise in cloud native serverless applications and solutions.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        Copyright © {new Date().getFullYear()} Clay Danford
      </footer>
    </div>
  )
}

export default Home
