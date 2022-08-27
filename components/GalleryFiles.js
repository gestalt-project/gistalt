import Icon from '@material-tailwind/react/Icon';
import { useRouter } from 'next/dist/client/router'
import { useCollection } from "react-firebase-hooks/firestore"
import { TextButton, IconButton } from '../components/Buttons';
import { useState, useEffect } from 'react';
import {round} from 'mathjs';

function GalleryStories(props) {
  const router = useRouter(),
    db = props.db,
    session = props.session,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    [storiesSnapshot] = useCollection(db.collection('stories').orderBy('timestamp', 'desc'))
    // [proposalsSnapshot] = useCollection(db.collection('proposals'))

    const voteResults = ([
      ['hello', 12],
      ['world', 63],
      ['bruh', 123],
      ['nine', 413],

    ])
    // const voteResults1 = {
    //   'hello': 12,
    //   'world': 13,
    //   'bruh': 123,
    // }
    



    const [proposalSelect, setProposalSelect] = useState('');
    const [selectedImgURL, setSelectedImgURL] = useState('');


    useEffect(() => {
    }, [proposalSelect]);

  const pluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`;

  
  const handleSubmit = (event) => {
    console.log("submit gist with id: ", proposalSelect)
  }

  
  const handleProposalChange = (event) => {
    setProposalSelect(event)
    console.log("proposalSelect: ", proposalSelect);
  }

  // create a function that takes in keys of IDS and values of votes and returns a percentage value for each key that is the percentage of votes for that key
  const getPercentage = (voteResults) => {
    const totalVotes = voteResults.reduce((a, b) => a + b[1], 0)
    const votePercentages = voteResults.map((vote) => {
      return [vote[0], round(vote[1] / totalVotes * 100)]
    }).sort((a, b) => b[1] - a[1])
    return votePercentages
  }

  const voteResultsPercentages = getPercentage(voteResults);

  return (


    <section className={'component-style px-0 md:px-0'}>
    {/* <h3 className="mx-24 my-12">Results</h3>
    {voteResultsPercentages?.map(([key, value]) => (
      <div>
          <p>{key}: {value}</p>
      </div>
    ))} */}

{voteResultsPercentages?.map(([key, value]) => (
  <div key={key} className="relative pt-1 mx-32">
      <p className=" ml-2 text-base text-gray-500">{key}</p>
    <div className="overflow-hidden h-2 mb-4 flex rounded bg-gray-200">

      <div style={{ width: `${value}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
    </div>
  </div>
  ))}

      <br></br><br></br><br></br><br></br><br></br><br></br>
      <h3 className="mx-24 mb-12">Proposals</h3>
      {storiesSnapshot?.docs.map((doc) => (
        <div key={doc.id} onClick={() => handleProposalChange(doc.id)} className={`${proposalSelect === doc.id ? "border-blue-500" : ""} border-sky-500 mx-12 my-6 flex bg-white border border-gray-300 rounded-xl overflow-hidden justify-start  transition duration-100 hover:scale-[1.01] `}>
          <div className="relative w-96 h-96 flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center">
              <img alt="" className="w-full h-full object-center" src={doc.data().storyCoverImg}/>                 
            </div>                   
          </div>
          <div className="p-4">                     
            <p className="text-lg font-bold text-gray-900 line-clamp-1">New Gist Proposal</p>
            <p className="text-sm text-gray-700 leading-10 mt-1 line-clamp-6">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"</p>               
          </div>        
        </div>
      ))}
      <div className="container mx-auto mt-32">
        <TextButton onClickFunc={handleSubmit} text="Cast Vote" size='3xl' />
      </div>
      


      <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>




      <h3 className="mx-24 my-4">Stories</h3>
      <div className='text-sm'>
        <div className="container mx-auto">
            <div className="flex flex-wrap -mx-12 my-4">
              {storiesSnapshot?.docs.map((doc) => (
                <div key={doc.id} className="lg:w-1/4 md:w-1/2 w-full p-1 my-3">
                  <div onClick={() => router.push(`/stories/${doc.id}`)} className="hover:border-2 hover:scale-[1.02] border-blue-500 bg-gray-200 max-w-xs m-1 rounded-2xl overflow-hidden shadow-lg">
                    <img className="object-cover h-48 w-96" src={doc.data().storyCoverImg} alt=""/>
                    <div className="px-6 py-4">
                      <p className="text-gray-500 text-xs pb-2">{pluralize(doc.data().storyNumContributors, 'contributor')}</p>
                      <div className="line-clamp-1 font-bold text-lg text-gray-800 mb-3">{doc.data().storyTitle}</div>
                      {/* <p className="line-clamp-2 text-gray-100 text-xs overflow-hidden">{doc.data().storyDescription}</p> */}
                    </div>
                    <div className="px-6 pb-2">
                      <p className="text-center text-gray-500 text-xs">{doc.data().storyGistIndex}/{doc.data().storyNumGists} Gists | 24hrs left | {doc.data().timestamp?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>


    </section>

  )
}

export { GalleryStories }