import { serverTimestamp } from "firebase/firestore";

function createStory(props) {
  const router = props.router,
  db = props.db,
  session = props.session,
  input = props.input

  if (!input) return

  db.collection('stories').add({
    storyTitle: input.storyTitle,
    storyDescription: input.storyDescription,
    storyGistProposeInterval: input.storyGistProposeInterval,
    storyGistVoteInterval: input.storyGistVoteInterval,
    storyNumGists: input.storyNumGists,
    // storyVotingMechanism: input.storyVotingMechanism,
    storyCoverImg: input.storyCoverImg,
    // storyCanon: '', // no repeats?
    storyNumContributors: 1,
    storyOriginator: session.user.name,
    storyGistIndex: 0,
    storyCurrentGistId: '',
    storyGistStage: 'waiting', // click start before beginning stage 1
    storyComplete: false,
    storyTimestamp: serverTimestamp(),
  }).then((docRef) => {
    // console.log("Document written with ID: ", docRef.id);
    router.push(`/live/${docRef.id}`)
  })

};

async function createGist(props) {
  const db = props.db,
  sid = props.sid,
  input = props.input
  if (!input) return
  
  const docRef = await db.collection('gists').add({
    gistIndex: input.gistIndex,
    gistCanonText: input.gistText,
    gistCanonImg: input.gistImg,
    gistCanonContributor: '',
    gistCanonProposalId: '',
    gistProposalNumVotes: {}, // { id: numVotes }
    gistProposalVotes: {}, // { id: [voterEmail, ...] }
    gistStage: 'propose', // propose, vote, or canon
    gistStory: sid,
    gistTimestamp: serverTimestamp(),
  })

  console.log("----------insidehandledata----------")
  console.log("newgistid", docRef.id)
  return docRef.id

};

async function createProposal(props) {
  const db = props.db,
  session = props.session,
  sid = props.sid,
  gid = props.gid,
  gistIndex = props.gistIndex,
  input = props.input
  if (!input) return
  
  const proposalRef = await db.collection('proposals').add({
    proposalGistIndex: gistIndex,
    proposalText: input.proposalText,
    proposalImg: input.proposalImg,
    proposalContributor: session.user.name,
    proposalStory: sid,
    proposalGist: gid,
    proposalTimestamp: serverTimestamp(),
  })
  // .then((docRef) => {
  //   return docRef.id
  //   // // console.log("Document written with ID: ", docRef.id);
  //   // router.push(`/live/${docRef.id}`)
  // })
  return proposalRef.id

};

function updateStory(props) {
  console.log('updatedata')
  const db = props.db,
  sid = props.sid,
  updateData = props.updateData

  db.collection('stories').doc(sid)
  .update(updateData)  

}

function updateGist(props) {
  console.log('updatedata')
  const db = props.db,
  gid = props.gid,
  updateData = props.updateData

  db.collection('gists').doc(gid)
  .update(updateData) 

}

async function executeQuery(props) {
  const db = props.db,
  collectionName = props.collectionName,
  queryParams = props.queryParams,
  orderBy = props.orderBy ? props.orderBy : null

  var fullSnapshot = db.collection(collectionName)
  // console.log('fullSnapshot', fullSnapshot)
  console.log('queryParams', queryParams)
  // console.log("fullSnaphsot", fullSnapshot)
  const unorderedQuerySnapshot = await fullSnapshot.where(queryParams[0], queryParams[1], queryParams[2])
  .get()
  // querySnapshot.forEach((doc) => {
  //   // doc.data() is never undefined for query doc snapshots
  //   console.log(doc.id, " => ", doc.data());
  // });
  // console.log(`'unorderedQuerySnapshot for ${collectionName}`, unorderedQuerySnapshot.docs)

  const querySnapshot = orderBy ? await unorderedQuerySnapshot.orderBy(orderBy.property, orderBy.order) : unorderedQuerySnapshot
  
  // console.log(`'querySnapshot for ${collectionName}`, querySnapshot.docs)
  return querySnapshot

}

async function executeGistQuery(props) {
  const db = props.db,
  collectionName = props.collectionName,
  queryParams = props.queryParams,
  orderBy = props.orderBy ? props.orderBy : null

  var fullSnapshot = db.collection(collectionName)
  // console.log('fullSnapshot', fullSnapshot)
  console.log('queryParams', queryParams)
  const unorderedQuerySnapshot = await fullSnapshot.where(queryParams[0], queryParams[1], queryParams[2]).orderBy('gistIndex', 'desc')
  .get()
  // querySnapshot.forEach((doc) => {
  //   // doc.data() is never undefined for query doc snapshots
  //   console.log(doc.id, " => ", doc.data());
  // });
  // console.log(`'unorderedQuerySnapshot for ${collectionName}`, unorderedQuerySnapshot.docs)

  // const querySnapshot = orderBy ? await unorderedQuerySnapshot.orderBy(orderBy.property, orderBy.order) : unorderedQuerySnapshot
  
  // console.log(`'querySnapshot for ${collectionName}`, querySnapshot.docs)
  return unorderedQuerySnapshot

}



export { createStory, createGist, createProposal, updateStory, updateGist, executeGistQuery, executeQuery };


// ///////////////////////////////////////////////////////////////////////////////

// function deleteData(props) {
//   console.log('deletedata')
//   const datatype = props.datatype,
//     db = props.db,
//     session = props.session,
//     id = props.id;

//   if (datatype != 'all') {
//     db.collection('userData').doc(
//       session.user.name).collection(datatype == 'story' ? 'stories' : String(datatype) + 's').doc(id).delete()
//   }

//   if (datatype === 'all') {
//     console.log('deleting all')
//     db.collection('userData').doc(session.user.name).collection('stories').get().then(function (querySnapshot) {
//       querySnapshot.forEach(function (doc) {
//         doc.ref.delete()
//       })
//     })
//     db.collection('userData').doc(session.user.name).collection('gists').get().then(function (querySnapshot) {
//       querySnapshot.forEach(function (doc) {
//         doc.ref.delete()
//       })
//     })
//     db.collection('userData').doc(session.user.name).collection('proposals').get().then(function (querySnapshot) {
//       querySnapshot.forEach(function (doc) {
//         doc.ref.delete()
//       })
//     })
//   }
// }

// ///////////////////////////////////////////////////////////////////////////////

// function branchData(props) {
//   const datatype = props.datatype,
//     db = props.db,
//     session = props.session,
//     [inDataSnapshot] = [props.inDataSnapshot],
//     gid = inDataSnapshot?.data()?.gist ? inDataSnapshot?.data()?.gist : null,
//     sid = inDataSnapshot?.data()?.story ? inDataSnapshot?.data()?.story : null,
//     dataName = props.dataName,
//     newDataName = props.newDataName;

//   // Doesn't actually copy the contents of the story / gist -> fix later
//   if (datatype === 'story') {
//     db.collection('userData').doc(
//       session.user.name).collection('stories').add({
//         storyName: newDataName ? newDataName : dataName,
//         timestamp: serverTimestamp(),
//       })
//   }

//   if (datatype === 'gist') {
//     db.collection('userData').doc(
//       session.user.name).collection('gists').add({
//         gistName: newDataName ? newDataName : dataName,
//         story: sid,
//         timestamp: serverTimestamp(),
//       })
//   }

//   if (datatype === 'proposal') {
//     db.collection('userData').doc(
//       session.user.name).collection('proposals').add({
//         proposalName: newDataName ? newDataName : dataName,
//         gist: gid,
//         story: sid,
//         editorState: inDataSnapshot?.data()?.editorState ? inDataSnapshot?.data()?.editorState : null,
//         playgroundState: inDataSnapshot?.data()?.playgroundState ? inDataSnapshot?.data()?.playgroundState : null,
//         timestamp: serverTimestamp(),
//       })
//   }
// };

// export { createData, updateData, deleteData, branchData }
