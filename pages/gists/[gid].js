import Head from 'next/head'
import Header from '../../components/Header'
import { getSession, useSession } from 'next-auth/react';
import Login from '../../components/Login'
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useDocument } from "react-firebase-hooks/firestore"
import { useRouter } from 'next/dist/client/router'
import { TextButton, IconButton } from '../../components/Buttons';
import { Canon } from '../../components/Canon';
import { GistProposals } from '../../components/GistProposals';
import { executeQuery } from '../../components/handleData';


export default function StoryPage() {
  const { data: session, status } = useSession();
  if (!session) return <Login />

  const router = useRouter(),
    { gid } = router.query,
    [gistSnapshot] = useDocument(db.collection('gists').doc(gid)),
    [proposalsData, setProposalsData] = useState(),
    proposalsQueryProps = {
      db: db,
      collectionName: 'proposals',
      queryParams: ["proposalGist", "==", gid]
    }

    useEffect(() => {
      loadProposals()
    }, [])

    const loadProposals = async () => {

      await executeQuery(proposalsQueryProps, {property: 'numVotes', order: 'desc'})
      .then((queryProposalsSnapshot) => {
      setProposalsData(queryProposalsSnapshot.docs)
      console.log("proposals data", proposalsData)
      })}
    
    
  return (
    <div>
      <Head>
        <title>Gestalt</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <section className='component-style pb-10 px-10'>
        {/* <div className='max-w-3xl mx-auto'> */}
        <div className="page-style">
        <h2 className='text-light-gray text-lg'>Gist # {gistSnapshot?.data()?.gistIndex}</h2>
          <br></br><br></br><br></br>
          <p className='text-light-gray text-sm'>Text: {gistSnapshot?.data()?.gistCanonText}</p>
          <br></br><br></br><br></br>
          <img className="w-60 h-60" src={gistSnapshot?.data()?.gistCanonImg} />

          <br></br><br></br><br></br><br></br><br></br><br></br>
          <GistProposals proposals={proposalsData}/>
          <br></br><br></br><br></br><br></br><br></br><br></br>
          <TextButton onClickFunc={() => router.push(`/stories/${gistSnapshot.data()?.gistStory}`)} text="View story" size='3xl' />
          </div>

      </section>

    </div>
  )
            }


  
export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  }
}

