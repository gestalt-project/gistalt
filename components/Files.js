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

////////////////////////////////////////////////////////////////////////////////

function MyStories(props) {
  const router = useRouter(),
    db = props.db,
    session = props.session,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    [storiesSnapshot] = useCollection(db.collection('userData').doc(
      session.user.name).collection('stories').orderBy('timestamp', 'desc')),  
    [moreModalType, setMoreModalType] = useState({ func: '', datatype: '', storyName: '', sid: '' })
    
  const moreModal = (
    moreModalType.func == 'update' ? <UpdateModal datatype={moreModalType.datatype} sid={moreModalType.sid} storyName={moreModalType.storyName} db={db} session={session} togglerFunc={setMoreModalType} /> : null
  )

  return (
    <section className={'component-style px-10 md:px-0'}>
      <div className='max-w-3xl mx-auto py-8 text-sm'>
        <div className='flex items-center justify-between pb=5'>
          <h2 className='text-lg pb-5 flex-grow'>My Stories</h2>
          <p className='mr-12'>Date Created</p>
          <Icon name='library_books' size='3xl' color='gray' />
        </div>

        {storiesSnapshot?.docs.map((doc) => (
          <div onClick={() => router.push(`/stories/${doc.id}`)} className='flex items-center p-4 rounded-lg hover:bg-mid-gray text-light-gray text-sm cursor-pointer'>
            <Icon name='library_books' size='3xl' color='blue' />
            <p className='flex-grow pl-5 w-10 pr-10 truncate'>{doc.data().storyName}</p>
            <p className='pr-5 text-sm'>{doc.data().timestamp?.toDate().toLocaleDateString()}</p>

            <IconButton onClickFunc={
              (e) => {
                console.log('story moreclicked')
                setMoreModalType({ func: 'update', datatype: 'story', storyName: doc.data().storyName, sid: doc.id })
                if (!e) var e = window.event;
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
              }
            } icon='more_vert' size='2xl' />

          </div>
        ))}

      </div>

      {moreModal}

    </section>

  )
}

////////////////////////////////////////////////////////////////////////////////

function Gists(props) {
  const router = useRouter(),
    db = props.db,
    session = props.session,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    [gistsSnapshot] = sid ? useCollection(db.collection('userData').doc(session.user.name).collection('gists').where('story', '==', sid).orderBy('timestamp', 'desc'))
      : useCollection(db.collection('userData').doc(session.user.name).collection('gists').orderBy('timestamp', 'desc')),
    [moreModalType, setMoreModalType] = useState({ func: '', datatype: '', gistName: '', gid: '' })

  const moreModal = (
    moreModalType.func == 'update' ? <UpdateModal datatype={moreModalType.datatype} gid={moreModalType.gid} gistName={moreModalType.gistName} db={db} session={session} togglerFunc={setMoreModalType} /> : null
  )

  return (
    <section className={'component-style px-10 md:px-0'}>
      <div className='max-w-3xl mx-auto py-8 text-sm'>
        <div className='flex items-center justify-between pb=5'>
          <h2 className='text-lg pb-5 flex-grow'>My Gists</h2>
          <p className='mr-12'>Date Created</p>
          <Icon name='library_books' size='3xl' color='gray' />
        </div>

        {gistsSnapshot?.docs.map((doc) => (
          <div onClick={() => router.push(`/gists/${doc.id}`)} className='flex items-center p-4 rounded-lg hover:bg-mid-gray text-light-gray text-sm cursor-pointer'>
            <Icon name='library_books' size='3xl' color='blue' />
            <p className='flex-grow pl-5 w-10 pr-10 truncate'>{doc.data().gistName}</p>
            <p className='pr-5 text-sm'>{doc.data().timestamp?.toDate().toLocaleDateString()}</p>

            <IconButton onClickFunc={
              (e) => {
                console.log('gist moreclicked')
                setMoreModalType({ func: 'update', datatype: 'gist', gistName: doc.data().gistName, gid: doc.id })
                if (!e) var e = window.event;
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
              }
            } icon='more_vert' size='2xl' />


          </div>
        ))}
      </div>

      {moreModal}

    </section>

  )
}

////////////////////////////////////////////////////////////////////////////////

function Proposals(props) {
  const router = useRouter(),
    db = props.db,
    session = props.session,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    [proposalsSnapshot] = sid ? useCollection(db.collection('userData').doc(session.user.name).collection('proposals').where('story', '==', sid).orderBy('timestamp', 'desc'))
      : gid ? useCollection(db.collection('userData').doc(session.user.name).collection('proposals').where('gist', '==', gid).orderBy('timestamp', 'desc'))
        : useCollection(db.collection('userData').doc(session.user.name).collection('proposals').orderBy('timestamp', 'desc')),
    [moreModalType, setMoreModalType] = useState({ func: '', datatype: '', proposalName: '', pid: '' })

  const moreModal = (
    moreModalType.func == 'update' ? <UpdateModal datatype={moreModalType.datatype} pid={moreModalType.pid} proposalName={moreModalType.proposalName} db={db} session={session} togglerFunc={setMoreModalType} /> : null
  )

  return (
    <section className={'component-style px-10 md:px-0'}>
      <div className='max-w-3xl mx-auto py-8 text-sm'>
        <div className='flex items-center justify-between pb=5'>
          <h2 className='text-lg pb-5 flex-grow'>My Proposals</h2>
          <p className='mr-12'>Date Created</p>
          <Icon name='article' size='3xl' color='gray' />
        </div>

        {proposalsSnapshot?.docs.map((doc) => (
          <div onClick={() => router.push(`/proposals/${doc.id}`)} className='flex items-center p-4 rounded-lg hover:bg-mid-gray text-light-gray text-sm cursor-pointer'>
            <Icon name='article' size='3xl' color='blue' />
            <p className='flex-grow pl-5 w-10 pr-10 truncate'>{doc.data().proposalName}</p>
            <p className='pr-5 text-sm'>{doc.data().timestamp?.toDate().toLocaleDateString()}</p>

            <IconButton onClickFunc={
              (e) => {
                console.log('proposal moreclicked')
                setMoreModalType({ func: 'update', datatype: 'proposal', proposalName: doc.data().proposalName, pid: doc.id })
                if (!e) var e = window.event;
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
              }
            } icon='more_vert' size='2xl' />

          </div>
        ))}
      </div>

      {moreModal}

    </section>

  )
}

export { AllStories, MyStories, Gists, Proposals }
