import Head from 'next/head'
import Header from '../../components/Header'
import { getSession, useSession } from 'next-auth/react';
import Login from '../../components/Login'
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useDocument } from "react-firebase-hooks/firestore"
import { useRouter } from 'next/dist/client/router'
import { TextButton, IconButton } from '../../components/Buttons';
import { executeGistQuery } from '../../components/handleData';
import { Canon } from '../../components/Canon';


export default function StoryPage() {
  const { data: session, status } = useSession();
  if (!session) return <Login />

  const router = useRouter(),
    { sid } = router.query,
    [storySnapshot] = useDocument(db.collection('stories').doc(sid)),
    [canonGists, setCanonGists] = useState(),
    [currentGistId, setCurrentGistId] = useState(),
    storyTitle = storySnapshot?.data()?.storyTitle,
    storyDescription = storySnapshot?.data()?.storyDescription,
    storyCoverImg = storySnapshot?.data()?.storyCoverImg,
    gistQueryProps = {
      db: db,
      collectionName: 'gists',
      queryParams: ["gistStory", "==", sid]
    }

    useEffect(() => {
      loadGists()
    }, [storySnapshot, currentGistId])


    const loadGists = async () => {
      await executeGistQuery(gistQueryProps, {property: 'gistIndex', order: 'ascend'}).then(async(reversedQueryGistsSnapshot) => {
  
        const queryGistsSnapshot = reversedQueryGistsSnapshot.docs.reverse()
        setCanonGists(queryGistsSnapshot.slice(0, -1))
        console.log("canon gists", canonGists)
        setCurrentGistId(queryGistsSnapshot[queryGistsSnapshot.length - 1]?.id)
        
      })
  
      
    }
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
          <div className='flex items-center justify-between py-6'>
            <h2 className='text-light-gray text-lg'>{storyTitle}</h2>
            <div className='flex items-center'>
              <IconButton onClickFunc={() => setModalType({ func: 'delete', datatype: 'all' })} icon='more_vert' />
              {/* <IconButton onClickFunc={() => setGistDisplay(!gistDisplay)} icon='library_books' color={gistDisplay ? 'blue' : 'gray'} />
              <IconButton onClickFunc={() => setProposalDisplay(!proposalDisplay)} icon='article' color={proposalDisplay ? 'blue' : 'gray'} /> */}
            </div>
          </div>
          <p className='text-light-gray text-sm'>{storyDescription}</p>
          <br></br>
          <br></br>
          <img className="w-60 h-60" src={storyCoverImg} />


          <br></br><br></br><br></br><br></br><br></br><br></br>
          <Canon db={db} session={session} sid={sid} canonGists={canonGists}/>

        </div>
              <br></br><br></br><br></br><br></br><br></br>
              <div className="page-style">
        <TextButton onClickFunc={() => router.push(`/live/${sid}`)} text="Join story" size='3xl' />
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

