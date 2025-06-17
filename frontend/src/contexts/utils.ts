import * as anchor from "@project-serum/anchor";
import { Program, Provider } from "@project-serum/anchor";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { COINFLIP_PDA_SEED, DISCORD_COINFLIP_ADMIN_CHANNELID, DISCORD_COINFLIP_NORMAL_CHANNELID, PLAYER_PDA_SEED, PROGRAM_ID, PROGRAM_IDL_COINFLIP, RPC_CURRENT } from "../constants";
import { Coinflip } from "../idl/coinflip";

export const programId = new PublicKey(PROGRAM_ID);
export const coinflip_pda_seed = COINFLIP_PDA_SEED;
export const player_pda_seed = PLAYER_PDA_SEED;
export const solConnection = new Connection(RPC_CURRENT, "confirmed");

export const getSolbalance = async (wallet: PublicKey) =>
{
  try
  {
    const balance = await solConnection.getBalance(wallet);
    return balance / LAMPORTS_PER_SOL;
  }
  catch (error)
  {
    console.log(error);
    return 0;
  }
};

export const getNetworkFromConnection: (connection: Connection) => WalletAdapterNetwork.Devnet | WalletAdapterNetwork.Mainnet = (connection: Connection) => {
    // @ts-ignore
    return connection._rpcEndpoint.includes('devnet') ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
}

export const getWalletPartiallyHidden = (walletAddress: PublicKey | null) => {
    const walletStr = walletAddress!.toString();
    const walletStart = walletStr.slice(0, 4);
    const walletEnd = walletStr.slice(-4);
    return `${walletStart}...${walletEnd}`
}

export const postWinOrLoseToDiscordAPI = async (userWallet: PublicKey, isWon: boolean, betAmount: any, connection: Connection) => {
    const wonEmoji = `<a:deezkits_confetti:1029282324170407936>`;
    const catPartyEmoji = `<a:deezkitsparty2:1029282335549558804>`;

    let message = ``;

    if (isWon)
    {
        message += `WOW! what a flip! \nA cool Kit just **Won** \`${betAmount*2}\` SOL ${wonEmoji} with a bet of \`${betAmount}\``;
    }
    else
    {
        message += `A Kit almost won \`${betAmount}\` SOL, better flip next time ${catPartyEmoji}`;
    }

    message += `\n\n> Wallet: \`${getWalletPartiallyHidden(userWallet)}\` \n`;

    await postToDiscordApi(message, DISCORD_COINFLIP_NORMAL_CHANNELID, getNetworkFromConnection(connection));
}

export const postWithdrawToDiscordAPI = async (userWallet: PublicKey | null, balance: any, connection: Connection, bankBalance: any, txSignature: string) => {
    let message = `\`${userWallet!.toString()}\``;
    message += `\n> Is asking to withdraw \`${balance}\` SOL`;
    message += `\n> Bank Balance \`${bankBalance}\` SOL`;

    const sigLink = `[${txSignature}](https://solscan.io/tx/${txSignature})`;
    message += `\n> Tx Signature: ${sigLink}`;

    await postToDiscordApi(message, DISCORD_COINFLIP_ADMIN_CHANNELID, getNetworkFromConnection(connection)); // coinflip/slots-admin
}

export const postToDiscordApi = async (message: string, channelId: string, network: string) => {
  return await axios.post("https://api.servica.io/extorio/apis/general",
      {
        method: "postDiscordDeezCoinFlip",
        params:
            {
              token: "tok41462952672239",
              channelId: channelId,
              message: message,
              network: network
            },
      });
}

export const filterError = (error: number) =>
{
  switch (error) {
    case 6000:
      return "Invalid Player Pool Owner";
    case 6001:
      return "Invalid Admin to Withdraw";
    case 6002:
      return "Invalid Claim to Withdraw Reward";
    case 6003:
      return "Invalid Reward Vault to receive";
    case 6004:
      return "Insufficient Bank SOL Balance";
    case 6005:
      return "Transaction failed, not enough balance";
    default:
      return "Unknown Error";
  }
};

export const getGameAddress = async (game_name: string, game_owner: PublicKey) => (
  await PublicKey.findProgramAddress(
    [
      Buffer.from(game_name),
      Buffer.from(coinflip_pda_seed),
      game_owner.toBuffer(),
    ],
    programId
  )
);

export const getPlayerAddress = async (playerKey: PublicKey, game: PublicKey) => (
  await PublicKey.findProgramAddress(
    [
      Buffer.from(player_pda_seed),
      playerKey.toBuffer(),
      game.toBuffer(),
    ],
    programId
  )
);

export function getProviderAndProgram(connection: Connection, anchorWallet: anchor.Wallet)
{
    const provider = new Provider(connection, anchorWallet, Provider.defaultOptions());
    const program = new Program(PROGRAM_IDL_COINFLIP, PROGRAM_ID, provider) as Program<Coinflip>;

    return {provider, program};
}

export async function getAta(mint: PublicKey, owner: PublicKey, allowOffCurve: boolean = false)
{
  return await getAssociatedTokenAddress(
    mint,
    owner,
    allowOffCurve
  );
}

export async function getCreateAtaInstruction(provider: Provider, ata: PublicKey, mint: PublicKey, owner: PublicKey) {
  let account = await provider.connection.getAccountInfo(ata);
  if (!account) {
    return createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,
      ata,
      owner,
      mint,
    );
  }
}