// authenticates users through different providers

// import NextAuth from "next-auth"
// import Providers from "next-auth/providers"
// import { FirebaseAdapter } from "@next-auth/firebase-adapter"
// import { db, firebaseClient } from "../../../firebase"

// export default NextAuth({
//   providers: [
//     // OAuth authentication providers
//     Providers.Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     // Providers.GitHub({
//     //   clientId: process.env.GITHUB_ID,
//     //   clientSecret: process.env.GITHUB_SECRET,
//     // }),
//   ],
//   adapter: FirebaseAdapter(db),
// })


import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';
import { FirebaseAdapter } from "@next-auth/firebase-adapter"
import { db, firebaseClient } from "../../../firebase"

export default async function auth(req, res) {
    const providers = [
        CredentialsProvider({
            name: 'Ethereum',
            credentials: {
                message: {
                    label: 'Message',
                    placeholder: '0x0',
                    type: 'text',
                },
                signature: {
                    label: 'Signature',
                    placeholder: '0x0',
                    type: 'text',
                },
            },
			async authorize(credentials) {
                try {
                    const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'));
                    const nextAuthUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
                    if (!nextAuthUrl) {
                        return null;
                    }
                    const nextAuthHost = new URL(nextAuthUrl).host;
                    if (siwe.domain !== nextAuthHost) {
                        return null;
                    }
                    if (siwe.nonce !== (await getCsrfToken({ req }))) {
                        return null;
                    }
                    await siwe.validate(credentials?.signature || '');
                    console.log(siwe.address);
                    return {
                      id: siwe.address,
                    };
                } catch(e){
                    console.log(e);
                    return null;
                }
			},
		}),
    ]

    if (!Array.isArray(req.query.nextauth)) {
        res.status(400).send('Bad request');
        return;
    }
  
    const isDefaultSigninPage = req.method === "GET" && req.query.nextauth.find(value => value === 'signin');

    // Hide Sign-In with Ethereum from default sign page
    if (isDefaultSigninPage) providers.pop()
  
    return await NextAuth(req, res, {
        providers,
        callbacks: {
            session: ({ token, session }) => {
                session.address = token.sub;
                session.user = {name: token.sub};
                return session;
            },
        },
        secret: process.env.NEXTAUTH_SECRET,
        session : {
            strategy : 'jwt',
        },
        adapter: FirebaseAdapter(db)
    });
  }