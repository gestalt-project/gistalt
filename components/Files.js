// renders data with action modal

import Icon from '@material-tailwind/react/Icon';
import { useRouter } from 'next/dist/client/router'
import { useCollection } from "react-firebase-hooks/firestore"
import { IconButton } from '../components/Buttons';
import { useState } from 'react';

function AllStories(props) {
  const router = useRouter(),
    db = props.db,
    session = props.session,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    [storiesSnapshot] = useCollection(db.collection('stories').orderBy('storyTimestamp', 'desc'))
    console.log("storiesSnapshot", storiesSnapshot?.docs)
    const pluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`;

  return (
    <section className={'font-openai component-style page-style px-10 md:px-0'}>
      {/* <div className='text-sm'> */}
        <div className="container mx-auto">
            <h3 className="mx-16 py-4">All Stories</h3>
            <div className="flex flex-wrap mx-12 my-4">
              {storiesSnapshot?.docs.map((doc) => (
                <div key={doc.id} className="lg:w-1/4 md:w-1/2 w-full p-1 my-3">
                  <div onClick={() => router.push(`/stories/${doc.id}`)} className="hover:border-2 hover:scale-[1.02] border-blue-500 bg-github-gray max-w-xs m-1 rounded-2xl overflow-hidden shadow-lg">
                    <img className="object-cover h-48 w-96" src={doc.data().storyCoverImg} alt=""/>
                    <div className="px-6 py-4">
                      <p className="text-gray-400 font-semibold text-xs pb-2">{doc.data().storyGistIndex}/{doc.data().storyNumGists} Gists | {doc.data().storyTimestamp?.toDate().toLocaleDateString()}</p>
                      <div className="line-clamp-1 font-semibold text-lg text-white mb-3">{doc.data().storyTitle}</div>
                      {/* <p className="line-clamp-2 text-gray-100 text-xs overflow-hidden">{doc.data().storyDescription}</p> */}
                    </div>
                    {/* <div className="px-6 pb-2">
                      <p className="text-center font-bold text-gray-400 text-xs">{doc.data().storyGistIndex}/{doc.data().storyNumGists} Gists | {doc.data().storyTimestamp?.toDate().toLocaleDateString()}</p>
                    </div> */}
                  </div>
                </div>
              ))}
            {/* </div> */}
        </div>
      </div>

    </section>

  )
}

export { AllStories }
