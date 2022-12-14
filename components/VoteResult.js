// import Icon from '@material-tailwind/react/Icon';
// import { useRouter } from 'next/dist/client/router'
// import { useCollection } from "react-firebase-hooks/firestore"
// import { TextButton, IconButton } from '../components/Buttons';
import { useState, useEffect } from 'react';
// import { updateGist } from '../components/handleData';
import {round} from 'mathjs';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';



function VoteResult(props) {
  const voteResults = props.voteResults, 
  activeProposals = props.activeProposals,
  gistCanonProposalId = props.gistCanonProposalId
  const [winningCanonText, setWinningCanonText] = useState();
  const [winningCanonImg, setWinningCanonImg] = useState();

    const getPercentage = (voteResults) => {
        // console.log("HELLO", voteResults)
        const totalVotes = voteResults.reduce((a, b) => a + b[1], 0)
        const votePercentages = voteResults.map((vote) => {
          return [vote[0], round(vote[1] / totalVotes * 100)]
        }).sort((a, b) => b[1] - a[1])
        return votePercentages
      }

    useEffect(() => {        
      console.log("activeProposals", activeProposals)
      console.log("gistCanonProposalId", gistCanonProposalId)
      {gistCanonProposalId?(
        setWinningCanonText(activeProposals.filter((proposal) => proposal.id === gistCanonProposalId)[0]?.data().proposalText),
        setWinningCanonImg(activeProposals.filter((proposal) => proposal.id === gistCanonProposalId)[0]?.data().proposalImg)

      ): console.log("hello")}
    }, [gistCanonProposalId, activeProposals])

  return (
    <section className={'component-style px-0 md:px-0'}>
      <h3 className="my-12">Results</h3>
      {voteResults !== {} && voteResults ? (
        <div>
          <h4 className="pb-4">Winner</h4>
          {winningCanonText ? (
            <Accordion className="bg-base-gray border text-light-gray text-sm">
            <AccordionDetails>
              <br></br>
              <p>Text: {winningCanonText}</p>
              <img width='200px' src={winningCanonImg !== "" ? winningCanonImg : "https://gistalt.s3.us-west-1.amazonaws.com/placeholder.png"}/>
            </AccordionDetails>

          </Accordion>)
          : <p className=" text-light-gray text-sm">no winner</p>
          }
          <br></br><br></br><br></br>
        
          {getPercentage(Object.entries(voteResults)).map(([key, value]) => (
            <div key={key} className="relative pt-1 mx-32">
              <p className=" ml-2 text-base text-gray-500">{key}</p>
              <div className="overflow-hidden h-2 mb-4 flex rounded bg-gray-200">
                <div style={{ width: `${value}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
          ))}
        </div>
      )
      : (<p>No votes</p>)
      }
    </section>

  )
}

export { VoteResult }