// renders all stories and

import Head from 'next/head'
import Header from '../components/Header'
import { getSession, useSession } from 'next-auth/react';
import Login from '../components/Login';
import React, { useState } from 'react';
import { db } from '../firebase';
import { AllStories } from '../components/Files';

export default function Home() {
  const { data: session, status } = useSession();
  console.log('=========session=========', session)
  console.log('=========status=========', status)
  if (!session) return <Login />

  return (
    <div>
      <Head>
        <title>Gestalt</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <AllStories db={db} session={session} />

    </div>
  )
}

// not sure what this is for?
export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  }
}
