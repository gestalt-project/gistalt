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
          <Accordion className="bg-base-gray border text-light-gray text-sm">
            <AccordionSummary>Proposal # {index + 1}</AccordionSummary>
            <AccordionDetails>
              
              <p>Text: {doc.data().proposalText}</p>
              <img width='200px' src={doc.data().proposalImg !== "" ? doc.data().proposalImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
              <br></br>
              <TextButton onClickFunc={() => router.push(`/gists/${doc.data().proposalGist}`)} text="View other proposals in this gist" size='3xl' />
            </AccordionDetails>

          </Accordion>
          )) : <p className=" text-light-gray text-sm">no canon to display yet</p>}    

    </div>
  )
}

export { UserProposals }