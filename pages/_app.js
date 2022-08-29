import 'tailwindcss/tailwind.css'
import "@material-tailwind/react/tailwind.css";
import Head from 'next/head';
// import { Provider } from "next-auth/client";
import '../styles.css';

// function MyApp({ Component, pageProps }) {
//   return (
//     <>
//       <Head>
//         <link
//           href="https://fonts.googleapis.com/icon?family=Material+Icons"
//           rel="stylesheet"
//         />
//       </Head>
//       <Provider session={pageProps.session}>
//         <Component {...pageProps} />
//       </Provider>
//     </>
//   );
// }

// export default MyApp;


// import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import { RainbowKitSiweNextAuthProvider, GetSiweMessageOptions} from '@rainbow-me/rainbowkit-siwe-next-auth';
import { SessionProvider } from 'next-auth/react';

var getSiweMessageOptions = function () { return ({
  statement: 'Sign in to Gistalt',
}); };

const { chains, provider } = configureChains(
  [chain.goerli, chain.mainnet, chain.optimism, chain.arbitrum],
  [
    // default key
    alchemyProvider({ apiKey: 'EYHw5wA9fkt51D0MRn01tLck-cdnT08G' /*process.env.ALCHEMY_ID*/ }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Gistalt',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})


function MyApp({ Component, pageProps }) {
  return (
    <>
        <Head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
      </Head>
    <WagmiConfig client={wagmiClient}>
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        <RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
          <RainbowKitProvider chains={chains} modalSize="compact"
            theme={darkTheme({
              accentColor: '#0d76fb',
              accentColorForeground: '#111414',
              borderRadius: 'small',
              fontStack: 'system',
              overlayBlur: 'small',
            })}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiConfig>
    </>
  );
}

export default MyApp
