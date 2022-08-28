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
  const [newCanonText, setNewCanonText] = useState();
  const [newCanonImg, setNewCanonImg] = useState();

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
        setNewCanonText(activeProposals.filter((proposal) => proposal.id === gistCanonProposalId)[0].data().proposalText),
        setNewCanonImg(activeProposals.filter((proposal) => proposal.id === gistCanonProposalId)[0].data().proposalImg)

      ): console.log("hello")}
    }, [gistCanonProposalId, activeProposals])

  return (
    <section className={'component-style px-0 md:px-0'}>
      <h3 className="my-12">Results</h3>
      {voteResults !== {} && voteResults ? (
        <div>
          <h4 className="">Winner</h4>
          <Accordion className="bg-base-gray border text-light-gray text-sm">
            <AccordionDetails>
              
              <p>Text: {newCanonText}</p>
              <img width='200px' src={newCanonImg !== "" ? newCanonImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
            </AccordionDetails>

          </Accordion>
        
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