// renders all stories

import Head from 'next/head'
import Header from '../components/Header'
import { getSession, useSession } from 'next-auth/react';
import Login from '../components/Login';
import React, { useState } from 'react';
import { db } from '../firebase';
import { GalleryStories } from '../components/GalleryFiles';

export default function Home() {
  const { data: session, status } = useSession();
  if (!session) return <Login />

  return (
    <div>
      <Head>
        <title>Gestalt</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <GalleryStories db={db} session={session} />

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
