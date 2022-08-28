
import Head from 'next/head'
import Header from '../components/Header'
import { getSession, useSession } from 'next-auth/react';
import Login from '../components/Login';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { TextButton, IconButton } from '../components/Buttons';
import { createProposal, updateGist, updateStory } from '../components/handleData';
import { GenerateImg } from '../components/GenerateImg';
import { Tooltip, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { useRouter } from 'next/dist/client/router'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

function Proposal(props) {
    
  const router = useRouter(),
    db = props.db,
    session = props.session,
    currentStoryId = props.currentStoryId,
    currentGistId = props.currentGistId,
    currentGistIndex = props.currentGistIndex,
    userProposedGist = props.userProposedGist,
    [proposalData, setProposalData] = useState({
        proposalText: null,
        proposalImg: null,
      }),
    [proposed, setProposed] = useState(false)

  const [messageFromChild, getMessageFromChild] = useState(
    "Parent component awaiting GenerateImg message"
  );

  useEffect(() => {
    if (userProposedGist) {
    setProposed(true)
    }
    else {
      setProposed(false)
    }
  }, [userProposedGist]);
  const sendDataToParent = (message) => {
    getMessageFromChild(message);
    console.log(messageFromChild);
  };

  useEffect(() => {
    setProposalData({ ...proposalData, proposalImg: messageFromChild })
    }, [messageFromChild]);

const handleSubmitProposal = async(event) => {
  if (proposalData.proposalImg  && proposalData.proposalText) {
    await createProposal({ input: proposalData, router: router, db: db, session: session, gid: currentGistId, sid: currentStoryId, gistIndex: currentGistIndex })
    .then((newProposalId) => {
      setProposed(true);
    })
  }
  else {
    alert("Please fill out all fields")
  }

}

  const handleInputChange = (event) => {
    setProposalData({ ...proposalData, [event.target.name]: event.target.value })
  }

  return (
    <div>
      <div className="component-style page-style">
        {proposed ? (
          <div>
          <h1 className='text-light-gray text-lg'>Your Proposal for Gist #{currentGistIndex}</h1>
          <br></br>
          <Accordion className="bg-base-gray border text-light-gray text-sm">
            <AccordionSummary>Gist #{currentGistIndex}</AccordionSummary>
            {/* <AccordionDetails>
              
              <p>Text: {proposalData.proposalText}</p>
              <img width='200px' src={proposalData.proposalImg !== "" ? proposalData.proposalImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
            
            </AccordionDetails> */}

            <AccordionDetails>
              
              <img className="mx-auto" width='300px' src={proposalData.proposalImg !== "" ? proposalData.proposalImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
              <br></br>
              <p className=" text-center text-light-gray">Text: {proposalData.proposalText}</p><br></br>
              <div className="flex justify-center pb-4">
              </div>
            </AccordionDetails>
            

          </Accordion>
          </div>
        )
        :
        <div>
        <h5>Propose a gist for Gist #{currentGistIndex}</h5>

        <form onSubmit={handleSubmitProposal}>
        <fieldset>
          <div>
            <label className="sr-only">Prompt</label>

            <div className="relative py-5">
            <div className="relative flex items-center flex-grow pt-5 border-t border-gray-400"></div>

              <br></br><br></br><br></br><br></br>
              <textarea name="proposalText" placeholder="Enter proposed text" onChange={ handleInputChange } id="message" rows="4" className="block p-2.5 w-full text-sm text-white bg-base-gray rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-base-gray dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={ proposalData.proposalText }></textarea>

              <br></br>

            </div>
          </div>
        </fieldset>
      </form>

      <GenerateImg db={db} session={session} sendDataToParent={sendDataToParent} />
      <TextButton onClickFunc={handleSubmitProposal} text="Submit proposal" size='3xl' />
      </div>
        }
      </div>
        
    </div>
  )
}

export { Proposal };