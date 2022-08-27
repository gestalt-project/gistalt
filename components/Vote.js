import Icon from '@material-tailwind/react/Icon';
import { useRouter } from 'next/dist/client/router'
import { useCollection } from "react-firebase-hooks/firestore"
import { TextButton, IconButton } from '../components/Buttons';
import { useState, useEffect } from 'react';
import { updateGist } from '../components/handleData';

function Vote(props) {
  const router = useRouter(),
    db = props.db,
    session = props.session,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    activeProposals = props.activeProposals,
    currentGist = props.currentGistSnapshot
    // currentGist = props.currentGist
    // [proposalsSnapshot] = useCollection(db.collection('proposals'))


    const [proposalSelect, setProposalSelect] = useState('');
    const [selectedImgURL, setSelectedImgURL] = useState('');

    // // console.log("activeProposals", activeProposals)
    // activeProposals ? activeProposals.map((doc) => {
    //     console.log("docid", doc.id)
    //     console.log("docdata", doc.data())
    // }) : console.log("no active proposals")
    // console.log("gid", gid)


    useEffect(() => {
    }, [proposalSelect]);

  // const pluralize = (count, noun, suffix = 's') =>
  //   `${count} ${noun}${count !== 1 ? suffix : ''}`;
  
  const handleVote = (event) => {
    // no need to check if voted because vote will be overridden until end of time period
    const newGistProposalVotes = currentGist.data().gistProposalVotes
    newGistProposalVotes[session.user.name] = proposalSelect

    console.log("newGistProposalVotes", newGistProposalVotes)
    console.log("voted for proposal with id: ", proposalSelect)
    updateGist({ updateData: { gistProposalVotes: newGistProposalVotes }, sid: sid, gid: gid, router: router, db: db, session: session });
    
  }

  
  const handleProposalChange = (event) => {
    setProposalSelect(event)
    console.log("proposalSelect: ", proposalSelect);
  }


  return (
    <section className={'component-style px-0 md:px-0'}>
      <br></br><br></br><br></br><br></br><br></br><br></br>
      <h3 className="mx-24 mb-12">Proposals</h3>
      {activeProposals?.map((doc) => (
        <div key={doc.id} onClick={() => handleProposalChange(doc.id)} className={`${proposalSelect === doc.id ? "border-blue-500" : ""} border-sky-500 mx-12 my-6 flex bg-github-gray border border-gray-300 rounded-xl overflow-hidden justify-start  transition duration-100 hover:scale-[1.01] `}>
          <div className="relative w-96 h-96 flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center">
              <img alt="" className="w-full h-full object-center" src={doc.data().proposalImg}/>                 
            </div>                   
          </div>
          <div className="p-4">                     
            <p className="text-lg font-bold text-gray-900 line-clamp-1">Proposal for Gist #{doc.data().proposalGistIndex}</p>
            <p className="text-sm text-gray-700 leading-10 mt-1 line-clamp-6">Text: {doc.data().proposalText}</p>               
          </div>        
        </div>
      ))}
      <div className="container mx-auto mt-32">
        <TextButton onClickFunc={handleVote} text="Cast Vote" size='3xl' />
      </div>



    </section>

  )
}

export { Vote }