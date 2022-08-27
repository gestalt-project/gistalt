// live session composed of story info, canon, and proposal
// generic progress bar / fraction idicator
// creation period with timer
// voting period with timer, proposals rendered in gallery format
// display results period with vote result in bar chart
// end of session, all canon rendered, GESTALT illustration, video in production, view collection button, link to read-only page / share button
// for canon-writers, redirect to minting page

import Head from 'next/head'
import Header from '../../components/Header'
import { getSession, useSession } from 'next-auth/react';
import Login from '../../components/Login'
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useDocument } from "react-firebase-hooks/firestore"
import { useRouter } from 'next/dist/client/router'
import { TextButton, IconButton } from '../../components/Buttons';
import { createGist, updateStory, updateGist, executeGistQuery, executeQuery } from '../../components/handleData';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import { Proposal } from '../../components/Proposal';
import { Vote } from '../../components/Vote';
import { VoteResult } from '../../components/VoteResult';
import { Canon } from '../../components/Canon';

import { serverTimestamp } from "firebase/firestore";
import firebase from 'firebase/compat/app';

// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// //console.log("=rofwe0jfsipjdDEBUGsoipewjrfpmsd", process.env.NEXT_PUBLIC_ALC_API_URL)
// //console.log("=rofwe0jfsipjdDEBUGsoipewjrfpmsd", process.env.FIREBASE_PROJECT_ID)
// const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALC_API_URL);  

// const contract = require('../../abis/FactoryGist.json');

export default function StoryPage() {
  const { data: session, status } = useSession();
  if (!session) return <Login />

  const router = useRouter(),
    { lid } = router.query,
    sid = lid,
    [storySnapshot] = useDocument(db.collection('stories').doc(sid)),
    [canonGists, setCanonGists] = useState(),
    [currentGistId, setCurrentGistId] = useState(),
    [currentGistSnapshot] = useDocument(db.collection('gists').doc(currentGistId)),
    [activeProposals, setActiveProposals] = useState(),
    [storyGistIndex, setStoryGistIndex] = useState(storySnapshot?.data()?.storyGistIndex ? storySnapshot?.data()?.storyGistIndex : 0),
    [storyGistStage, setStoryGistStage] = useState(storySnapshot?.data()?.storyGistStage ? storySnapshot?.data()?.storyGistStage : 'waiting'),
    [voteRawResults, setVoteRawResults] = useState(currentGistSnapshot?.data()?.gistProposalVotes),
    [voteResults, setVoteResults] = useState(currentGistSnapshot?.data()?.gistProposalNumVotes),
    [gistCanonProposalId, setGistCanonProposalId] = useState(currentGistSnapshot?.data()?.gistCanonProposalId),
    storyTitle = storySnapshot?.data()?.storyTitle,
    storyDescription = storySnapshot?.data()?.storyDescription,
    storyCoverImg = storySnapshot?.data()?.storyCoverImg,
    [gistQueryProps, setGistQueryProps] = useState({
      db: db,
      collectionName: 'gists',
      queryParams: ["gistStory", "==", sid]
    }),
    [storyComplete, setStoryComplete] = useState(storySnapshot?.data()?.storyComplete),
    
    [userProposedGist, setUserProposedGist] = useState(), 
    [nowTime, setNowTime] = useState(firebase.firestore.Timestamp.now().seconds),
    [nextStatus, setNextStatus] = useState('start'),
    [userContributedGists, setUserContributedGists] = useState(),
    [progressPercentage, setProgressPercentage] = useState(0)

    const resultsInterval = 5

    useEffect(() => {
      loadGists()
      setStoryGistIndex(storySnapshot?.data().storyGistIndex)
      setStoryGistStage(storySnapshot?.data().storyGistStage)
    }, [storySnapshot, currentGistId])

    useEffect(() => {
      setVoteRawResults(currentGistSnapshot?.data()?.gistProposalVotes)
    }, [currentGistSnapshot])


    useEffect(() => {
      setInterval(() => {setNowTime(firebase.firestore.Timestamp.now().seconds)}, 100)
      // console.log("progress percent", progressPercentage)
    })

    useEffect(() => {
      setInterval(() => {setNowTime(firebase.firestore.Timestamp.now().seconds)}, 100)
      // console.log("progress percent", progressPercentage)
    })

    useEffect(() => {
      if (storySnapshot?.data().storyStartTimestamp) {
        const proposalInterval = parseInt(storySnapshot?.data().storyGistProposeInterval)
        const voteInterval = parseInt(storySnapshot?.data().storyGistVoteInterval)
        const storyStartTimestamp = storySnapshot?.data().storyStartTimestamp.seconds
        const totalGistInterval = proposalInterval + voteInterval + resultsInterval
        if (nowTime - storyStartTimestamp < 
        3 + storySnapshot?.data().storyNumGists * (totalGistInterval)
        ) {
      console.log("stage: ", storyGistStage)
      if (storyGistStage === 'propose') {
        setProgressPercentage(100 * ((proposalInterval + (storyGistIndex - 1) * (totalGistInterval)) - nowTime + storyStartTimestamp) / proposalInterval)

        if (nowTime - storyStartTimestamp > 
        proposalInterval 
        + (storyGistIndex - 1) * (totalGistInterval)
        ) {
          console.log("proposal stage over")
          setStoryGistStage('vote')
          updateStory({ updateData: { storyGistStage: 'vote' }, sid: lid, router: router, db: db, session: session });
        }
      }
      if (storyGistStage === 'vote') {
        setProgressPercentage(100 * ((proposalInterval + voteInterval + (storyGistIndex - 1) * (totalGistInterval)) - nowTime + storyStartTimestamp) / voteInterval)
        if (nowTime - storyStartTimestamp > 
        (proposalInterval + voteInterval)
        + (storyGistIndex - 1) * (totalGistInterval)
        ) {
          setStoryGistStage('results')
          updateStory({ updateData: { storyGistStage: 'results' }, sid: lid, router: router, db: db, session: session });
          console.log("vote stage over")
        }
      }
      if (storyGistStage === 'results') {
        setProgressPercentage(100 * ((storyGistIndex * (totalGistInterval)) - nowTime + storyStartTimestamp) / resultsInterval)
        calculateResults()
        if (nowTime - storyStartTimestamp >
        storyGistIndex * (proposalInterval + voteInterval + resultsInterval)
        ) {
          console.log("result stage over")
          if (session.user.email === storySnapshot?.data().storyOriginator) {
          if (nextStatus) {
          console.log("nextStatus", nextStatus)
          setNextStatus(false)
          handleNext()
          }
          }
        }
      }
      if (storyGistStage === 'waiting') {
        console.log("waiting")
      }
    }
  }
    }, [nowTime, storyGistStage])

  const key = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
  const axios = require('axios');
  
  const pinJSONToIPFS = async(JSONBody) => {
      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
      //making axios POST request to Pinata ⬇️
      return axios 
          .post(url, JSONBody, {
              headers: {
                  pinata_api_key: key,
                  pinata_secret_api_key: secret,
              }
          })
          .then(function (response) {
              return {
                  success: true,
                  pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
              };
          })
          .catch(function (error) {
              console.log(error)
              return {
                  success: false,
                  message: error.message,
              }
  
      });
  };

  const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
  const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALC_API_URL);  
  
  const contract = require('../../abis/Gistalt.json');
  const contractABI = contract.abi;
  const contractAddress = "0xA8B74b2878558923F42511e20f8a318787eEC975";


  const onStoryEnd = async() => { // returns {success, status}
    console.log("do stuff onStoryEnd")
    setUserContributedGists(canonGists.filter(
      function (gist) {
        // console.log("gistsdfsdf", gist.data().gistCanonContributor)
        return gist.data().gistCanonContributor === session.user.name;
      })
    )
    console.log("userContributedGists", userContributedGists)

    if(storySnapshot?.data()?.storyOriginator == session.user.name){
      // upload metadata to ipfs -- create URI
      var metadatas = [];

      canonGists.filter(
        function (gist) {
          // console.log("gistsdfsdf", gist.data().gistCanonContributor)
          const currentGistImg = gist.data().gistCanonImg;
          const currentGistText = gist.data().gistCanonText;
          const currentGistIndex = gist.data().gistIndex;
          

          const metadata = new Object();

          metadata.name = "Gist" + currentGistIndex;
          metadata.image = currentGistImg;
          metadata.description = currentGistText;

          metadatas.push(metadata);
          // return gist.data().gistCanonContributor === session.user.name;
      })

      // var jsonMetadata = JSON.stringify(metadatas);
      // const curURI = await pinJSONToIPFS(jsonMetadata);
      // console.log("curURI: ", curURI, "curURI.success", curURI.success)
      // if (!curURI.success) {
      //   return {
      //     success: false,
      //     status: "Something went wrong while uploading your tokenURI.",
      //   }
      // } 

      // const tokenURI = curURI.pinataUrl;  
      // window.contract = await new web3.eth.Contract(contractABI, contractAddress);
      // console.log("window: ", window, "window.contract", window.contract)

      // // deploy a ERC 1155
      // const curContractName = (storySnapshot?.data()?.storyTitle).split(' ').join(''); // story name, trim spaces
      
      // // number of items in the set
      // const numItems = storySnapshot?.data()?.storyNumGists;
      // const curIds = Array.from({length: numItems}, (_, i) => i + 1)

      // // the name of each item in the set
      // //Gist1 to N
      // var curNames = [];
      // for(var i = 0; i < curIds.length; i++){
      //   const curN = "Gist" + curIds[i];
      //   curNames.push(curN);
      // }

      // const transactionParameters = {
      //   to: contractAddress, // Required except during contract publications.
      //   from: window.ethereum.selectedAddress, // must match user's active address.
      //   'data': window.contract.methods.deployERC1155(curContractName, tokenURI, curIds, curNames).encodeABI() //make call to NFT smart contract 
      // };

      // //sign transaction via Metamask
      // try {
      //   const txHash = await window.ethereum
      //       .request({
      //           method: 'eth_sendTransaction',
      //           params: [transactionParameters],
      //       });
      //   //return {
      //   //    success: true,
      //   console.log("Check out your transaction on Etherscan: https://goerli.etherscan.io/tx/" + txHash);
      //   //}
      // } catch (error) {
      //   console.log("error");
      //   //return {
      //   //    success: false,
      //   console.log("Something went wrong: " + error.message);
      //   //}
      // }
    }
  }


  const loadGists = async () => {
    await executeGistQuery(gistQueryProps, {property: 'gistIndex', order: 'ascend'}).then(async(reversedQueryGistsSnapshot) => {

      const queryGistsSnapshot = reversedQueryGistsSnapshot.docs.reverse()
      setCanonGists(queryGistsSnapshot.slice(0, -1))
      console.log("canon gists", canonGists)
      setCurrentGistId(queryGistsSnapshot[queryGistsSnapshot.length - 1]?.id)
      if (queryGistsSnapshot[queryGistsSnapshot.length - 1]?.id) {
          await executeQuery({
              db: db,
              collectionName: 'proposals',
              queryParams: ["proposalGist", "==", queryGistsSnapshot[queryGistsSnapshot.length - 1]?.id]
            }
            , {property: 'numVotes', order: 'desc'}).then((queryProposalsSnapshot) => {
            const filterResults = queryProposalsSnapshot.docs.filter(function (doc) {
              return doc.data().proposalContributor === session.user.name;
            });
            setActiveProposals(queryProposalsSnapshot.docs)
            setUserProposedGist(filterResults.length > 0 ? filterResults : null)
          })
      }
      
    })

    
  }

  const calculateResults = () => {
    const newVoteResults = {}
    if (voteRawResults){
      for (const [key, value] of Object.entries(voteRawResults)) {
        newVoteResults[value] = newVoteResults[value] ? newVoteResults[value] + 1  : 1       }
      setVoteResults(newVoteResults)
      if (Object.keys(newVoteResults).length > 0) {
      const winningProposalId = Object.keys(newVoteResults).reduce((a, b) => newVoteResults[a] > newVoteResults[b] ? a : b)
      const newCanonText = activeProposals.filter((proposal) => proposal.id === winningProposalId)[0].data().proposalText
      const newCanonImg = activeProposals.filter((proposal) => proposal.id === winningProposalId)[0].data().proposalImg
      const newCanonContributor = activeProposals.filter((proposal) => proposal.id === winningProposalId)[0].data().proposalContributor
      updateGist({ updateData: { gistCanonContributor: newCanonContributor, gistCanonText: newCanonText, gistCanonImg: newCanonImg, gistProposalNumVotes: newVoteResults, gistCanonProposalId: winningProposalId }, gid: currentGistId, router: router, db: db, session: session });
      setGistCanonProposalId(winningProposalId)
    }
    }
  }

  const handleNext = async(e) => {
    setStoryGistStage('propose')
    console.log("calling handleNext, gistindex = ", storyGistIndex)
    const emptyGist = {
      gistIndex: storyGistIndex + 1,
      gistText: '',
      gistImg: '',
      sid: sid,
    }
      const newGistId = await createGist({ input: emptyGist, sid: lid, router: router, db: db, session: session })
      if (storyGistStage == "waiting") {
      updateStory({ updateData: { storyStartTimestamp: serverTimestamp(), storyGistIndex: storyGistIndex + 1, storyGistStage: 'propose' }, sid: lid, router: router, db: db, session: session });
      }
      else {
      updateStory({ updateData: { storyGistIndex: storyGistIndex + 1, storyGistStage: 'propose' }, sid: lid, router: router, db: db, session: session });
      }
      setStoryGistIndex(storyGistIndex + 1)
      setCurrentGistId(newGistId)
      newGistId ? setNextStatus('ready') : setNextStatus('executing')
  }

    // const mintNFT = async(gistData) => {
  //   alert("NFT minted :)")
  //   console.log("gistData", gistData)
  //   console.log("gistIndex: ", gistData.gistIndex)
  //   console.log("gistText: ", gistData.gistCanonText)
  //   // const imgURL = "https://i.pinimg.com/originals/e8/a5/3d/e8a53d53d55976b2f16034d3e6e1f5f9.jpg"
  //   // console.log("minting NFT with placeholder image: ", gistData.gistCanonImg)
  //   // 


  const mintNFT = async (gistData) => {
    const url = gistData.gistCanonImg
    const name = `Gist ${gistData.gistIndex}`
    const description = gistData.gistCanonText

    // error handling
    if (url.trim() == "" || (name.trim() == "" || description.trim() == "")) { 
        return {
         success: false,
         status: "Please make sure all fields are completed before minting.",
        }
    }
    
    //make metadata
    const metadata = new Object();
    metadata.name = name;
    metadata.image = url;
    metadata.description = description;
    //make pinata call
    const pinataResponse = await pinJSONToIPFS(metadata);
    if (!pinataResponse.success) {
        return {
            success: false,
            status: "Something went wrong while uploading your tokenURI.",
        }
    } 
    const tokenURI = pinataResponse.pinataUrl;  
    console.log("tokenURI: ", tokenURI)
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);

    //set up your Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        'data': window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeABI() //make call to NFT smart contract 
    };
    console.log("transactionParameters", transactionParameters)

    //sign transaction via Metamask
    try {
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        // return {
            // success: true,
            console.log("Check out your transaction on Etherscan: https://goerli.etherscan.io/tx/" + txHash)
        // }
    } catch (error) {
        // return {
        //     success: false,
            console.log("Something went wrong: " + error.message)
        // }
    }
}

  // const mintNFT = async(gistData) => {
  //   alert("NFT minted :)")
  //   console.log("gistData", gistData)
  //   console.log("gistIndex: ", gistData.gistIndex)
  //   console.log("gistText: ", gistData.gistCanonText)
  //   // const imgURL = "https://i.pinimg.com/originals/e8/a5/3d/e8a53d53d55976b2f16034d3e6e1f5f9.jpg"
  //   // console.log("minting NFT with placeholder image: ", gistData.gistCanonImg)
  //   // 
  //   // const gistName = "Gist" + gistData.gistIndex;

  //   // const currentERCIndex = 6;

  //   // console.log(currentERCIndex);
  //   // console.log(gistName);

  //   // const transactionParameters = {
  //   //   to: contractAddress, // Required except during contract publications.
  //   //   from: window.ethereum.selectedAddress, // must match user's active address.
  //   //   'data': window.contract.methods.mintERC1155(currentERCIndex, gistName, 1).encodeABI() //make call to NFT smart contract 
  //   // };

  //   // //sign transaction via Metamask
  //   // try {
  //   //   const txHash = await window.ethereum
  //   //       .request({
  //   //           method: 'eth_sendTransaction',
  //   //           params: [transactionParameters],
  //   //       });
  //   //   //return {
  //   //   //    success: true,
  //   //   console.log("Check out your transaction on Etherscan: https://goerli.etherscan.io/tx/" + txHash);
  //   //   //}
  //   // } catch (error) {
  //   //   console.log("error");
  //   //   //return {
  //   //   //    success: false,
  //   //   console.log("Something went wrong: " + error.message);
  //   //   //}
  //   // }

  // }
  

  return (
    <div>
      <Head>
        <title>Gestalt</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      { storyGistIndex > storySnapshot?.data()?.storyNumGists ? (
          <section className='component-style page-style pb-10 px-10'>
          <TextButton onClickFunc={() => alert("yey")} text="Story finished!" size='3xl' />
          <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
          <TextButton onClickFunc={() => router.push(`/stories/${lid}`)} text="View published story" size='3xl' />
          <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
          <p className='text-light-gray text-lg'>... display contributions here ...</p>
          <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
          { userContributedGists ? userContributedGists?.map((doc) => (
          <Accordion className="bg-base-gray border text-light-gray text-sm">
            <AccordionSummary>Gist #{doc.data().gistIndex}</AccordionSummary>
            <AccordionDetails>
              
              <p>Text: {doc.data().gistCanonText}</p>
              <img width='200px' src={doc.data().gistCanonImg !== "" ? doc.data().gistCanonImg : "https://image.pngaaa.com/721/1915721-middle.png"}/>
              <br></br>
              <TextButton onClickFunc={() => mintNFT(doc.data())} text="Mint NFT" size='3xl' />
            </AccordionDetails>

          </Accordion>
          )) : <p className=" text-light-gray text-sm">no canon to display yet</p>}    

          <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
          <TextButton onClickFunc={mintNFT} text="Mint NFT" size='3xl' />
        </section>
      )
      :
      <>
      {storyGistStage == 'waiting' && storySnapshot?.data()?.storyOriginator == session.user.name ? (
      <section className='component-style page-style pb-10 px-10'>
        <TextButton onClickFunc={handleNext} text="Start story" size='3xl' />
      </section>
        ) :
        storyGistStage == 'waiting' && storySnapshot?.data()?.storyOriginator !== session.user.name ? (
          <section className='component-style page-style pb-10 px-10'>
          <TextButton onClickFunc={() => alert("Ask the story originator to begin the story")} text="Story has not yet begun" size='3xl' />
        </section>
          ) :
        <section className='component-style page-style pb-10 px-10'>
        <div className='max-w-3xl mx-auto'>
          <div className='flex items-center justify-between py-6'>
            <h1 className='text-light-gray text-lg'>{storyTitle}</h1>
            <div className='flex items-center'>
            </div>
          </div>
          <p className='text-light-gray text-sm'>{storyDescription}</p>
          <br></br><br></br>
          <img className="w-60 h-60" src={storyCoverImg} />
          <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
          </div>
          <Canon db={db} session={session} sid={lid} canonGists={canonGists}/>

        </section>

        }
        <section className='component-style page-style'>
        <p className='text-light-gray text-sm'>Stage: {storyGistStage}</p>
        <div className="overflow-hidden h-2 my-2 flex rounded bg-gray-200">
          <div style={{ width: `${100 - progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
        </div>
        </section>

          { storyGistStage == 'propose' ? (
            
            <div>
            <Proposal userProposedGist={userProposedGist} db={db} session={session} currentStoryId={lid} currentGistId={currentGistId} currentGistIndex={storyGistIndex}/>
            </div>
          )
        
          : storyGistStage == 'vote' ? (
            <section className='component-style page-style'>
            <Vote currentGistSnapshot={currentGistSnapshot} activeProposals={activeProposals} db={db} session={session} sid={lid} gid={currentGistId}/>
            </section>
          )
        
          : storyGistStage == 'results' ? (
            <section className='component-style page-style'>
            <VoteResult gistCanonProposalId={gistCanonProposalId} voteResults={voteResults}/>
            </section>
          ) : null 
        
          }
          </>
        }
                    {/* <section className='component-style page-style pb-10 px-10'>
          <TextButton onClickFunc={() => setStoryGistStage('propose')} text="set stage: propose" size='3xl' />
          <TextButton onClickFunc={() => setStoryGistStage('vote')} text="set stage: vote" size='3xl' />
          <TextButton onClickFunc={() => setStoryGistStage('results')} text="set stage: results" size='3xl' />
        </section> */}

    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  }
}
