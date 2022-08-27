import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { TextButton, IconButton } from './Buttons';
import { useRouter } from 'next/dist/client/router'

function GistProposals(props) {
  const router = useRouter(),
  gists = props.gists

  return (
    <div>

        <h1 className='text-light-gray text-lg'>Proposals</h1>
          <br></br><br></br>

          { gists? gists?.map((doc, index) => (
          <Accordion className="bg-base-gray border text-light-gray text-sm">
            <AccordionSummary>Proposal # {index + 1}</AccordionSummary>
            <AccordionDetails>
              
              <p>Text: {doc.data().proposalText}</p>
              <img width='200px' src={doc.data().proposalImg !== "" ? doc.data().proposalImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
              {/* <TextButton onClickFunc={() => router.push(`/gists/${doc.id}`)} text="View proposal details" size='3xl' /> */}
            </AccordionDetails>

          </Accordion>
          )) : <p className=" text-light-gray text-sm">no canon to display yet</p>}    

    </div>
  )
}

export { GistProposals }