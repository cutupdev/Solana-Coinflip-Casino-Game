import React, { Fragment, useState, useEffect } from 'react'
import { Button, Typography, useMediaQuery, Stack, Link } from '@mui/material'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { SOLANA_HOST } from "../utils/const";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new anchor.web3.Connection(SOLANA_HOST);

const Navbar = ({balance}) => {
  const wallet = useWallet();

  // const [balance, setBalance] = useState(0);

  // useEffect(() => {
  //   (async () => {
  //     if (wallet?.publicKey) {
  //       const balance = await connection.getBalance(wallet.publicKey);
  //       setBalance(balance / LAMPORTS_PER_SOL);
  //     }
  //   })();
  // }, [wallet, connection]);

  return (
    <nav className="navbar">
      <Link to="/">
        <img
          src="/assets/logo.png"
          alt="logo"
          style={{ width: '40px', height: '20px' }}
        />
      </Link>
      <Link to="/">
        <Typography
          style={{
            color: '#000',
            fontSize: '34px',
            fontWeight: 'bold',
            fontFamily: 'Helvetica-Bold,AdobeInvisFont,MyriadPro-Regular',
          }}
        >
          SoLucky
        </Typography>
      </Link>
      <Typography
        style={{
          color: '#000',
          fontSize: '16px',
          marginTop: '10px',
          fontFamily: 'ErasITC-Light,AdobeInvisFont,MyriadPro-Regular',
        }}
      >
        Provable fair games that is entirely based on smart contract with low
        1% transaction fees, no sign ups & deposits.
      </Typography>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
        <WalletMultiButton />
        <Typography
          style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'Helvetica-Bold,AdobeInvisFont,MyriadPro-Regular',
          }}
        >
          {
            wallet.connected ? `(${balance.toFixed(2)} SOL)` : ''
          }
        </Typography>
      </Stack>
    </nav>
  )
}

export default Navbar
