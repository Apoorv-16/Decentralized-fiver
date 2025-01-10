"use client";
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletModalProvider
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //const network = WalletAdapterNetwork.Mainnet;
  const network = WalletAdapterNetwork.Testnet;

  // You can also provide a custom RPC endpoint.
  //const endpoint = "https://solana-mainnet.g.alchemy.com/v2/-eboHZcDPhjacXv3jlamfa51bqXKzxfR";
  const endpoint = "https://solana-devnet.g.alchemy.com/v2/4sRoCKZfSv2Bs0n-nU7bTVSkpjH7s0Al"

  const wallets = useMemo(
      () => [],
      [network]
  );

    return (
    <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                {children}
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
  );
}
