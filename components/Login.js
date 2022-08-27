import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Login() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Gistalt</title>
        <meta name="description" content="gistalt" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-12" data-aos="zoom-y-out">Welcome To <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-gray-200">Gistalt.</span></h1>
        <p></p>
        <ConnectButton />
      </main>
    </div>
  )
}
