// simple create flow

import Head from 'next/head'
import Header from '../components/Header'
import { getSession, useSession } from 'next-auth/react';
import Login from '../components/Login';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { TextButton, IconButton } from '../components/Buttons';
import { createStory } from '../components/handleData';
import { GenerateImg } from '../components/GenerateImg';
import { Tooltip, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { useRouter } from 'next/dist/client/router'

export default function Create() {
  const { data: session, status } = useSession();
  if (!session) return <Login />
  const router = useRouter()

  const [storyData, setStoryData] = useState({
    storyTitle: null,
    storyDescription: null,
    storyGistProposeInterval: null,
    storyGistVoteInterval: null,
    storyNumGists: null,
    storyCoverImg: null,
    // storyVotingMechanism: '',
  })

  const [messageFromChild, getMessageFromChild] = useState(
    "Parent component awaiting GenerateImg message"
  );

  useEffect(() => {
    console.log("messageFromChild useEffect", messageFromChild)
    setStoryData({ ...storyData, storyCoverImg: messageFromChild })
}, [messageFromChild]);

  const sendDataToParent = (message) => {
    getMessageFromChild(message);
    console.log("recieved message from child: ");
    console.log(messageFromChild);
  };
  

  const handleSubmit = (event) => {
    console.log("storyData", storyData)
    if (storyData.storyTitle && storyData.storyDescription && storyData.storyCoverImg && storyData.storyGistProposeInterval && storyData.storyGistVoteInterval && storyData.storyNumGists) {
    console.log("storyData: ", storyData);
    createStory({ input: storyData, router: router, db: db, session: session });
    alert(`"${storyData.storyTitle}" created!`);
    }
    else {
      alert("Please fill out all fields")
    }
  }

  const handleInputChange = (event) => {
    console.log("setting storyData: ", event.target.name, event.target.value);
    setStoryData({ ...storyData, [event.target.name]: event.target.value })
  }

  return (
    <div>
      <Head>
        <title>Gestalt</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <div className="component-style page-style">
        <h5>Create a new story</h5>

        <form onSubmit={handleSubmit}>
        <fieldset>
          <div>
            <label className="sr-only">Prompt</label>

            <div className="relative py-5">
            <div className="relative flex items-center flex-grow pt-5 border-t border-gray-400"></div>

              <input
                name="storyTitle"
                className="w-full p-4 text-sm rounded-lg border border-gray-300 shadow-sm font-medium font-extrabold bg-base-gray"
                placeholder="Enter story title"
                onChange={ handleInputChange }
                value={ storyData.storyTitle }
              />

              <br></br><br></br><br></br><br></br>
              <textarea name="storyDescription" placeholder="Enter story description" onChange={ handleInputChange } id="message" rows="4" className="block p-2.5 w-full text-sm text-white bg-base-gray rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-base-gray dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={ storyData.storyDescription }></textarea>

              <br></br>

              <label className="mt-6 block mb-2 text-sm font-bold font-medium text-white dark:text-gray-400">How many total gists should be in the story? </label>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
            >

              <FormControlLabel name="storyNumGists" value="3" control={<Radio />} label="3 gists" onChange={ handleInputChange }/>
              <FormControlLabel name="storyNumGists" value="5" control={<Radio />} label="5 gists" onChange={ handleInputChange }/>
              <FormControlLabel name="storyNumGists" value="10" control={<Radio />} label="10 gists" onChange={ handleInputChange }/>
            </RadioGroup>

              <label className="mt-6 block mb-2 text-sm font-bold font-medium text-white dark:text-gray-400">How long should the proposal period be / gist? </label>
              <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
            >
              <FormControlLabel  name="storyGistProposeInterval" value="15" control={<Radio />} label="dev 15s" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistProposeInterval" value="30" control={<Radio />} label="30 seconds" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistProposeInterval" value="60" control={<Radio />} label="1 minute" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistProposeInterval" value="300" control={<Radio />} label="5 minutes" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistProposeInterval" value="1200" control={<Radio />} label="20 minutes" onChange={ handleInputChange }/>
              {/* <FormControlLabel name="storyGistProposeInterval" value="3600" control={<Radio />} label="60 minutes" onChange={ handleInputChange }/> */}
            </RadioGroup>

            <label className="mt-6 block mb-2 text-sm font-bold font-medium text-white dark:text-gray-400">How long will the voting period be / gist? </label>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
            >
              <FormControlLabel name="storyGistVoteInterval" value="15" control={<Radio />} label="dev 15s" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistVoteInterval" value="30" control={<Radio />} label="30 seconds" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistVoteInterval" value="60" control={<Radio />} label="1 minute" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistVoteInterval" value="300" control={<Radio />} label="5 minutes" onChange={ handleInputChange }/>
              <FormControlLabel name="storyGistVoteInterval" value="1200" control={<Radio />} label="20 minutes" onChange={ handleInputChange }/>
            </RadioGroup>

            <br></br>
            {/* <label className="block mb-2 text-sm font-bold font-medium text-white dark:text-gray-400">Select Voting Mechanism: </label> */}
            {/* <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
            >
              <FormControlLabel name="storyVotingMechanism" value="1p1v" control={<Radio />} label="one-person one-vote" onChange={ handleInputChange }/>
              <FormControlLabel name="storyVotingMechanism" value="1d1v" control={<Radio />} label="one-dollar one-votes" onChange={ handleInputChange }/>
              <FormControlLabel name="storyVotingMechanism" value="qv" control={<Radio />} label="quadratic voting" onChange={ handleInputChange }/>
            </RadioGroup> */}
            </div>
          </div>
        </fieldset>
      </form>

      <GenerateImg db={db} session={session} sendDataToParent={sendDataToParent} />
      <TextButton onClickFunc={handleSubmit} text="Create story" size='3xl' />
      </div>
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
