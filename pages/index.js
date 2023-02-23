import styles from '../styles/Home.module.css'
import { useWallet } from '@solana/wallet-adapter-react';
import useWalletBalance from '../context/useWalletBalance';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';
import { Dashboard } from '../components/dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import * as anchor from "@project-serum/anchor";
import { SOLANA_HOST } from "../utils/const";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function Home() {
  const wallet = useWallet();
  const [balance, setBalance] = useState(0);

  const connection = new anchor.web3.Connection(SOLANA_HOST);


  const Welcome = styled(Typography)(({ theme }) => ({
    fontSize: '40px !important',
    textAlign: 'center',
    background:
      '-webkit-linear-gradient( #a44e01 15%, #e2a139 60%, #ffda6f 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginTop: '18%'
  }));

  const updateBalance = async () => {
    if (wallet?.publicKey) {
      const balance = await connection.getBalance(wallet.publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    }
  };

  return (
    <>
      <Navbar balance={balance} />

      {
        wallet.connected ?
          <Dashboard connected={wallet.connected} updateBalance={updateBalance} balance={balance}/>
          :
          <Welcome>
            ~ Please connect your wallet to play Coin flip game ~
          </Welcome>
      }
    </>
  )
}
