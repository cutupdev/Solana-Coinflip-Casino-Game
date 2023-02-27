import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import coin_flip from './coin_flip.json';

export const CLUSTER =
  process.env.REACT_APP_CLUSTER === "mainnet"
    ? "mainnet"
    : process.env.REACT_APP_CLUSTER === "testnet"
    ? "testnet"
    : "devnet";

export const SOLANA_HOST = process.env.REACT_APP_SOLANA_API_URL
  ? process.env.REACT_APP_SOLANA_API_URL
  : CLUSTER === "mainnet"
  ? clusterApiUrl("mainnet-beta")
  : CLUSTER === "testnet"
  ? clusterApiUrl("devnet")
  // : "http://localhost:8899";
  : "https://api.devnet.solana.com";

  console.log(SOLANA_HOST)

  export const STABLE_POOL_PROGRAM_ID = new PublicKey(
    'FMgTFH3VJUfZVqGoqjjcskrxKWU3MUkCGV5NtnF6MYa1',
  );
  
  export const STABLE_POOL_IDL = coin_flip;