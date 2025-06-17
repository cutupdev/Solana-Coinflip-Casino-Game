import {
    PartiallyDecodedInstruction
} from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { addTx, init } from './db';
import { solConnection } from '.';

export const NONCE = "29L53hyG";


export const performTx = async (
    txId: string,
) => {
    try {
        let txInfo = await getDataFromSignature(txId);
        console.log("AMMO Transaction info getting... ")
        if (txInfo !== undefined) {
            init();
            addTx(
                txInfo.signature,
                txInfo.address,
                txInfo.type,
                txInfo.bet_amount,
                txInfo.block_hash,
                txInfo.win
            );
        }
    } catch (e) {
        console.log(e, "Error form the performTx");
        return false;
    }
}
    

export const sleep = (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time))
}


// Parse activity from a transaction siganture
export const getDataFromSignature = async (sig: string) => {

    // Get transaction data from on-chain
    let tx;
    try {
      tx = await solConnection.getParsedTransaction(sig, "confirmed");
    } catch (e) {}
  
    if (!tx) {
      console.log(`Can't get Transaction for ${sig}`);
      return;
    }
  
    if (tx.meta?.err !== null) {
      console.log(`Failed Transaction: ${sig}`);
      return;
    }
  
    // Parse activty by analyze fetched Transaction data
    let length = tx.transaction.message.instructions.length;
    let valid = 0;
    let hash = "";
    let ixId = -1;
    for (let i = 0; i < length; i++) {
        hash = (
          tx.transaction.message.instructions[i] as PartiallyDecodedInstruction
        ).data;
        if (hash !== undefined && hash.slice(0, 8) === NONCE) {
            valid = 1;
        }
        if (valid === 1) {
            ixId = i;
            break;
        }
    }
  
    if (ixId === -1 || valid === 0) {
      return;
    }
  
    let ts = tx.slot ?? 0;
    if (!tx.meta.innerInstructions) {
      console.log(`Can't parse innerInstructions ${sig}`);
      return;
    }

    
  
    let accountKeys = (
      tx.transaction.message.instructions[ixId] as PartiallyDecodedInstruction
    ).accounts;
    let signer = accountKeys[0].toBase58();
      
    let bytes = bs58.decode(hash);
    let a = bytes.slice(10, 18).reverse();
    let type = new anchor.BN(a).toNumber();
    let b = bytes.slice(18, 26).reverse();
    let sol_price = new anchor.BN(b).toNumber();

    let state = type === ts%2 ? 1: 0;

    let result = {
        type: type,
        address: signer,
        bet_amount: sol_price,
        block_hash: ts,
        win: state,
        signature: sig,
    };
      
    return result;
  };