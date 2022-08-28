import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { TextButton, IconButton } from './Buttons';
import { useRouter } from 'next/dist/client/router'

function Canon(props) {
    const router = useRouter(),
    session = props.session,
    db = props.db,
    sid = props.sid,
    canonGists = props.canonGists

  return (
    <div>

          <h4 className="">Canon</h4>
          <br></br><br></br>

          { canonGists? canonGists?.map((doc) => (
          <Accordion className="bg-base-gray border text-white text-sm">
            <AccordionSummary>Gist #{doc.data().gistIndex}</AccordionSummary>
            <AccordionDetails>

            <img className="mx-auto" width='300px' src={doc.data().gistCanonImg !== "" ? doc.data().gistCanonImg : "https://gistalt.s3.us-west-1.amazonaws.com/placeholder.png"}/>
              <br></br>
              <p className=" text-center text-light-gray">TText: {doc.data().gistCanonText}</p><br></br>
              <div className="flex justify-center pb-4">
              <TextButton onClickFunc={() => router.push(`/gists/${doc.id}`)} text="View gist details" size='3xl' />
              </div>
              
              {/* <p>Text: {doc.data().gistCanonText}</p>
              <img width='200px' src={doc.data().gistCanonImg !== "" ? doc.data().gistCanonImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
              <br></br>
              <TextButton onClickFunc={() => router.push(`/gists/${doc.id}`)} text="View gist details" size='3xl' /> */}

            </AccordionDetails>

          </Accordion>
          )) : <p className=" text-light-gray text-sm">no canon to display yet</p>}    

    </div>
  )
}

export { Canon }