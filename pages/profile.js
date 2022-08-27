// // about page

// import Head from 'next/head'
// import Header from '../components/Header'
// import { getSession, useSession } from 'next-auth/react';
// import Login from '../components/Login';
// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase';
// import { Stories, Gists, Proposals } from '../components/Files';
// import { TextButton, IconButton } from '../components/Buttons';
// import { createData, deleteData, updateData, branchData } from '../components/handleData';
// import { GenerateImg } from '../components/GenerateImg';
// import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
// import { useRouter } from 'next/dist/client/router'


// import { Tooltip } from '@mui/material';

// export default function home() {
//   const { data: session, status } = useSession();
//   if (!session) return <Login />

//   const router = useRouter()


//   return (
//     <div>
//       <Head>
//         <title>Gistalt</title>
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <Header />
//       <div className="component-style page-style">
//         <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">Collaborative Story Generation with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-gray-400">Gistalt.</span></h1>
//         <br></br><br></br><br></br><br></br><br></br>
//         <div class="flex mb-4">
//             <div class="w-1/2">
//                 <h6 className= "flex-initial w-96 text-sm">Gistalt is a collective storytelling platform where people contribute to stories by generating multimodal content using AI, and decide on the canon of these stories via decentralized autonomous organizations (DAOs).</h6>
//             </div>
//             <div class="w-1/2"></div>
//         </div>
//         <br></br><br></br><br></br><br></br><br></br>
//         <TextButton onClickFunc={() => router.push(`/create`)} text="Create story" size='3xl' />
//       </div>
//     </div>
//   )
// }

// // not sure what this is for?
// export async function getServerSideProps(context) {
//   const session = await getSession(context);

//   return {
//     props: {
//       session,
//     },
//   }
// }



