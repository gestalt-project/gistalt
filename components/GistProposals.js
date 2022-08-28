import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { TextButton, IconButton } from './Buttons';
import { useRouter } from 'next/dist/client/router'

function GistProposals(props) {
  const router = useRouter(),
  proposals = props.proposals

  return (
    <div>

        <h1 className='text-light-gray text-lg'>All Proposals</h1>
          <br></br><br></br>

          { proposals? proposals?.map((doc, index) => (
          <Accordion className="bg-base-gray border text-light-gray text-sm">
            <AccordionSummary>Proposal # {index + 1}</AccordionSummary>


            <AccordionDetails>
              
              <img className="mx-auto" width='300px' src={doc.data().proposalImg !== "" ? doc.data().proposalImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
              <br></br>
              <p className=" text-center text-light-gray">Text: {doc.data().proposalText}</p><br></br>
              <div className="flex justify-center pb-4">
              </div>
            </AccordionDetails>


            {/* <AccordionDetails>
              
              <p>Text: {doc.data().proposalText}</p>
              <img width='200px' src={doc.data().proposalImg !== "" ? doc.data().proposalImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
            </AccordionDetails> */}

          </Accordion>
          )) : <p className=" text-light-gray text-sm">no canon to display yet</p>}    

    </div>
  )
}

export { GistProposals }