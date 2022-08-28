import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { TextButton, IconButton } from './Buttons';
import { useRouter } from 'next/dist/client/router'

function UserProposals(props) {
  const router = useRouter(),
  proposals = props.proposals
  // console.log("propopsals", proposals)

  return (
    <div>

          { proposals? proposals?.map((doc, index) => (
          <Accordion className="bg-base-gray border text-white text-sm">
            <AccordionSummary>Proposal # {index + 1}</AccordionSummary>
            <AccordionDetails>
              
              <img className="mx-auto" width='300px' src={doc.data().proposalImg !== "" ? doc.data().proposalImg : "https://gistalt.s3.us-west-1.amazonaws.com/placeholder.png"}/>
              <br></br>
              <p className=" text-center text-light-gray">Text: {doc.data().proposalText}</p><br></br>
              <div className="flex justify-center pb-4">
              <TextButton onClickFunc={() => router.push(`/gists/${doc.data().proposalGist}`)} text="View other proposals in this gist" size='3xl' />
              </div>
            </AccordionDetails>

          </Accordion>
          )) : <p className=" text-light-gray text-sm">no canon to display yet</p>}    

    </div>
  )
}

export { UserProposals }