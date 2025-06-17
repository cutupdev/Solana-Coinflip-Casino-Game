import * as anchor from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { createCloseAccountInstruction, createSyncNativeInstruction, NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PartiallyDecodedInstruction, PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction } from "@solana/web3.js";
import { errorAlert, successAlert } from "../components/toastGroup";
import { gamename, game_owner, NONCE, prices, PROGRAM_ID } from "../constants";
import { IDL as GameIDL } from "../idl/coinflip";
import { filterError, getAta, getCreateAtaInstruction, getGameAddress, getPlayerAddress, getProviderAndProgram, postWithdrawToDiscordAPI, solConnection } from "./utils";

export const initializeUserPool = async (anchorWallet: anchor.Wallet) =>
{
    
  const {provider} = await getProviderAndProgram(solConnection, anchorWallet);
    try
    {
        let tx = await getAddPlayerTransaction(anchorWallet);
        if (tx)
        {
          let { blockhash } = await provider.connection.getLatestBlockhash("confirmed");
          tx.feePayer = anchorWallet.publicKey;
          tx.recentBlockhash = blockhash;
          if (anchorWallet.signTransaction !== undefined)
          {
            let signedTx = await anchorWallet.signTransaction(tx);

            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {skipPreflight: true, maxRetries: 3,  preflightCommitment: "confirmed"});
            await solConnection.confirmTransaction(txId, "confirmed");
          }
        }
        successAlert("Transaction confirmed!");
    }
    catch (error)
    {
      console.log(error);
    }
};

export const playGame = async (
  anchorWallet: anchor.Wallet,
  setValue: number,
  deposit: number,
  setLoading: Function,
  setDepositLoading: Function,
  setFlipLoading: Function,
  setEnd: Function,
  setProgress: Function,
  setIsDec: Function,
  setIsInc: Function,
  setIsWon: Function,
  setIsStartFlipping: Function,
  updatePage: Function
) =>
{
    if (anchorWallet.publicKey === null)
      return;

    let txId = "";
    try
    {
      setLoading(true);
      setDepositLoading(true);
      setProgress(true);
      const { provider } = getProviderAndProgram(solConnection, anchorWallet);

      console.log("Bet:", deposit);
      let tx = await createPlayGameTx(anchorWallet, setValue, deposit);
      // console.log("tx", tx);

      const program = new anchor.Program(GameIDL as anchor.Idl, PROGRAM_ID, provider);
      const [game] = await getGameAddress(gamename, game_owner);
      const [player] = await getPlayerAddress(anchorWallet.publicKey, game);
      let userPoolData : any;
      if (tx)
      {
          let {blockhash} = await provider.connection.getLatestBlockhash("finalized");
          tx.feePayer = anchorWallet.publicKey;
          tx.recentBlockhash = blockhash;
          if (anchorWallet.signTransaction !== undefined)
          {
              let signedTx = await anchorWallet.signTransaction(tx);
              txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {skipPreflight: true, maxRetries: 3, preflightCommitment: "finalized"});
              const txConfirmation: any = await solConnection.confirmTransaction(txId, "confirmed");
              
              // solConnection.onSignature(txId, (sig) =>
              // {
              //     program.account.playerPool.fetch(playerPoolKey).then((x) =>
              //     {
              //         const userPoolData = x as unknown as PlayerPool;
              //         console.log("userPoolData Callback reward:", txId, userPoolData.gameData.rewardAmount.toNumber());
              //     })
              //
              // }, "finalized")

              userPoolData = await program.account.player.fetch(player);
              // console.log("TxId confirmed:", txId);
              //console.log("userPoolData reward:", userPoolData.gameData.rewardAmount.toNumber());
              //console.log("txConfirmation", txConfirmation);
              //console.log("txConfirmation value", txConfirmation.value);
              //console.log("txConfirmation error", txConfirmation.value.err);

              if (txConfirmation.value.err === null)
              {
                  // Tx Success, play FE
                  setDepositLoading(false);
                  setIsDec(true);
                  setFlipLoading(true);
              }
              else
              {
                  // @ts-ignore
                  const errorCode = txConfirmation.value.err.InstructionError[1].Custom;

                  // Tx ERROR!
                  //console.error("Tx Error", txConfirmation.value.err);

                  const errorTxt = filterError(errorCode);

                  errorAlert(errorTxt);
                  console.error("Tx Error", errorTxt, errorCode);

                  setEnd(false);
                  setDepositLoading(false);
                  setFlipLoading(false);
                  setProgress(false);
                  setLoading(false);
                  return undefined;
              }
          }
      }

      
      await new Promise((resolve) => { setTimeout(resolve, 500) });
      const slotNum = await getSlotNumber(txId);

      // console.log("Program RewardAmount:", userPoolData.gameData.rewardAmount.toNumber());

      const parsed = await solConnection.getParsedTransaction(txId, "confirmed");
      const logs = parsed?.meta?.logMessages;
      const isWonOnChain = logs?.indexOf('Program log: Reward: 0')! <= 0; //not found means won

      console.log("isWonOnChain:", isWonOnChain);

      // BUGGY:
      // let isWon = false;
      // if (userPoolData.gameData.rewardAmount.toNumber() > 0) {
      //   isWon = true;
      // }

      let isWon = isWonOnChain;

      updatePage();
      setIsStartFlipping(true);

      await new Promise((resolve) => { setTimeout(resolve, 2500) });

      setIsInc(true);
      setFlipLoading(false);
      setEnd(true);
      setLoading(false);
      setIsWon(isWon);

      // setProgress(false);
      // successAlert("Transaction confirmed!");
      return userPoolData;
    }
    catch (error)
    {
      setEnd(false);
      setDepositLoading(false);
      setFlipLoading(false);
      setProgress(false);
      setLoading(false);
      console.log(error);
      return undefined;
    }
};

export const claim = async (anchorWallet: anchor.Wallet, startLoading: Function, closeLoading: Function, playAgain: Function, updatePage: Function) =>
{
    if (anchorWallet.publicKey === null)
        return;

    try
    {
        startLoading();
        const { provider } = await getProviderAndProgram(solConnection, anchorWallet);

        const userFundsBalanceBeforeWithdrawal = await getUserFundsBalanceSOL(anchorWallet);

        let tx = await createClaimTx(anchorWallet);
        let txId = "";
        if (tx)
        {
          let { blockhash } = await provider.connection.getLatestBlockhash("confirmed");
          tx.feePayer = anchorWallet.publicKey;
          tx.recentBlockhash = blockhash;
          if (anchorWallet.signTransaction !== undefined)
          {
            let signedTx = await anchorWallet.signTransaction(tx);
            txId = await provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true, maxRetries: 3, preflightCommitment: "confirmed" });
            await solConnection.confirmTransaction(txId, "confirmed");
          }
        }

        closeLoading();
        successAlert("Transaction confirmed!");

        const bankBalance = await getBankBalanceSOL(anchorWallet);

        await postWithdrawToDiscordAPI(anchorWallet.publicKey, userFundsBalanceBeforeWithdrawal, provider.connection, bankBalance, txId);

        await playAgain();
        await updatePage();
      }
      catch (error)
      {
        closeLoading();
        console.log(error);
    }
};

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

async function getAddPlayerTransaction(anchorWallet: anchor.Wallet) {
  const {program, provider} = await getProviderAndProgram(solConnection, anchorWallet);
  const [game] = await getGameAddress(gamename, game_owner);

  const [player, bump] = await getPlayerAddress(
    provider.wallet.publicKey,
    game
  );

  console.log("Player:", player.toString());
  console.log("Game:", game.toString());
  return program.transaction.addPlayer(bump, {
    accounts: {
      payer: provider.wallet.publicKey,
      player,
      game,
      systemProgram: SystemProgram.programId,
    },
  });
}

export const createPlayGameTx = async (anchorWallet: anchor.Wallet, setNum: number, deposit: number) =>
{
  const { program, provider } = await getProviderAndProgram(solConnection, anchorWallet);
  const [game] = await getGameAddress(gamename, game_owner);
  const [player] = await getPlayerAddress(provider.wallet.publicKey, game);

  const transaction = new Transaction();
  const playerAccount = await program.provider.connection.getAccountInfo(
    player
  );
  if (!playerAccount) {
    transaction.add(await getAddPlayerTransaction(anchorWallet));
  }

  let gameData = await program.account.game.fetchNullable(game);
  if (!gameData) return;

  const mint = gameData.tokenMint;
  const payerAta = await getAta(mint, provider.wallet.publicKey);
  
  let instruction = await getCreateAtaInstruction(provider, payerAta, mint, provider.wallet.publicKey);
  if (instruction) transaction.add(instruction);
  if (mint.toString() === NATIVE_MINT.toString()) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: payerAta,
        lamports: deposit * LAMPORTS_PER_SOL
      }),
      createSyncNativeInstruction(payerAta)
    )
  }
  const gameTreasuryAta = await getAta(mint, game, true);
  const commissionTreasury = gameData.royaltyWallet;
  const commissionTreasuryAta = await getAta(mint, commissionTreasury);
  instruction = await getCreateAtaInstruction(provider, commissionTreasuryAta, mint, commissionTreasury);
  if (instruction) transaction.add(instruction);
  const betNo = prices.indexOf(deposit);
  transaction.add(
    program.transaction.play(betNo, setNum, {
      accounts: {
        payer: provider.wallet.publicKey,
        payerAta,
        player,
        game,
        gameTreasuryAta,
        royaltyTreasuryAta: commissionTreasuryAta,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })
  );
  
  return transaction;
};

export const createClaimTx = async (anchorWallet: anchor.Wallet) =>
{
  const {program, provider} = getProviderAndProgram(solConnection, anchorWallet);
  const [game] = await getGameAddress(gamename, game_owner);
  const [player] = await getPlayerAddress(provider.wallet.publicKey, game);

  const gameData = await program.account.game.fetchNullable(game);
  if (!gameData) return;
  
  const mint = gameData?.tokenMint;
  const transaction = new Transaction();

  const claimerAta = await getAta(mint, provider.wallet.publicKey);
  
  const instruction = await getCreateAtaInstruction(provider, claimerAta, mint, provider.wallet.publicKey);
  if (instruction) transaction.add(instruction);
  

  const gameTreasuryAta = await getAta(mint, game, true);

  transaction.add(
      program.transaction.claim({
          accounts: {
              claimer: provider.wallet.publicKey,
              claimerAta,
              game,
              gameTreasuryAta,
              player,
              instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
              tokenProgram: TOKEN_PROGRAM_ID,
          },
      })
  );
  if (mint.toString() === NATIVE_MINT.toString()) {
    transaction.add(
      createCloseAccountInstruction(
        claimerAta,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
      )
    );
  }  

  return transaction;
};

export const getGlobalState = async (anchorWallet: anchor.Wallet) =>
{
  const { program } = getProviderAndProgram(solConnection, anchorWallet);
  const [game] = await getGameAddress(gamename, game_owner);
  try
  {
      let globalState = await program.account.game.fetch(game);
      return globalState;
  }
  catch
  {
      return null;
  }
};

export const getUserPoolState = async (anchorWallet: anchor.Wallet) =>
{
  const { program } = getProviderAndProgram(solConnection, anchorWallet);
  const [game] = await getGameAddress(gamename, game_owner);
  const [player] = await getPlayerAddress(anchorWallet.publicKey, game);

  try
  {
      let poolState = await program.account.player.fetch(player);
      return poolState;
  }
  catch
  {
      return null;
  }
};

export const getUserFundsBalanceSOL = async (anchorWallet: anchor.Wallet) =>
{
    const funds = await getUserPoolState(anchorWallet);
    return funds ? Number((funds.earnedMoney.toNumber() / LAMPORTS_PER_SOL).toFixed(2)) : 0;
}

export const getBankBalance = async (anchorWallet: anchor.Wallet) =>
{
  const gameData = await getGlobalState(anchorWallet);
  return gameData?.mainBalance.toNumber() || 0;
};

export const getBankBalanceSOL = async (anchorWallet: anchor.Wallet) =>
{
    return Number(((await getBankBalance(anchorWallet)) / LAMPORTS_PER_SOL).toFixed(2));
};

// Get Signatures related with Program Pubkey
export const getAllTransactions = async (programId: PublicKey) =>
{
      const data = await solConnection.getSignaturesForAddress(programId, { limit: 15 }, "confirmed");
      let result = [];
      let txdata = data.filter((tx) => tx.err === null);
      let cnt = 0;

      for (let i = 0; i < txdata.length; i++) {
        let rt = await getDataFromSignature(txdata[i].signature);
        if (rt !== undefined && cnt < 10) {
          cnt++;
          result.push(rt);
        }
      }
      return result;
};

export const getSlotNumber = async (sig: string) =>
{
    let tx;
    try {
      tx = await solConnection.getParsedTransaction(sig, "confirmed");
    } catch (e) {}

    if (!tx) {
      return;
    }

    let ts = tx.slot ?? 0;
    return ts;
};

// Parse activity from a transaction Signature
export const getDataFromSignature = async (sig: string) =>
{
    // Get transaction data from on-chain
    let tx;
    try
    {
        tx = await solConnection.getParsedTransaction(sig, "confirmed");
    }
    catch (e) {}

    if (!tx)
    {
        return;
    }

    if (tx.meta?.err !== null) {
        return;
    }

    const logs = tx.meta.logMessages;
    const lose = logs!.indexOf('Program log: Reward: 0');
    
    // Parse activty by analyze fetched Transaction data
    let length = tx.transaction.message.instructions.length;
    let valid = 0;
    let hash = "";
    let ixId = -1;
    for (let i = 0; i < length; i++)
    {
      hash = (tx.transaction.message.instructions[i] as PartiallyDecodedInstruction).data;
      if (hash !== undefined && hash.slice(0, 8) === NONCE)
      {
        valid = 1;
      }

      if (valid === 1)
      {
        ixId = i;
        break;
      }
    }

    if (ixId === -1 || valid === 0)
    {
      return;
    }

    let ts = tx.slot ?? 0;
    let timestamp = tx.blockTime ?? 0;
    if (!tx.meta.innerInstructions)
    {
      return;
    }

    let accountKeys = (tx.transaction.message.instructions[ixId] as PartiallyDecodedInstruction).accounts;
    const [game] = await getGameAddress(gamename, game_owner);
    
    if (accountKeys[2].toString() !== game.toString()) return;

    let signer = accountKeys[0].toBase58();

    let bytes = bs58.decode(hash);
    //console.log(bytes);
    let sol_price = prices[bytes[8]] * LAMPORTS_PER_SOL;
    let type = bytes[9];

    let state = lose < 0 ? 1 : 0;

    let result =
        {
            type: type,
            address: signer,
            bet_amount: sol_price,
            block_hash: ts,
            block_timestamp: timestamp,
            win: state,
            signature: sig
        };

    return result;
};
