import { PublicKey } from "@solana/web3.js";
import GameIDLJson from "./idl/coinflip.json";

export const CF_VERSION = 0.4;

export const PLAYER_POOL_SIZE = 112;
export const LAMPORTS = 1000000000;
export const GLOBAL_AUTHORITY_SEED = "global-authority";
export const VAULT_AUTHORITY_SEED = "vault-authority";
export const PLAYER_POOL_SEED = "player-pool";
export const COINFLIP_PDA_SEED = "coinflip_game_pda";
export const PLAYER_PDA_SEED = "player_pda";

export const RPC_MAINNET = "https://quiet-aged-frog.solana-mainnet.quiknode.pro/6a56c0f12de472ff85a245955e5ff33d99704b1a/"
export const RPC_DEVNET = "https://delicate-withered-theorem.solana-devnet.quiknode.pro/0399d35b8b5de1ba358bd014f584ba88d7709bcf/";
export const RPC_CURRENT = RPC_DEVNET;

export const PROGRAM_IDL_COINFLIP = require("./idl/coinflip.json");
export const PROGRAM_ID = GameIDLJson.metadata.address;
export const gamename = "test4";
export const game_owner = new PublicKey("SERVUJeqsyaJTuVuXAmmko6kTigJmxzTxUMSThpC2LZ");

export const NONCE = "D15Y14vE";

export const DISCORD_COINFLIP_NORMAL_CHANNELID = "1034779571637198858";
export const DISCORD_COINFLIP_ADMIN_CHANNELID = "1034452457599807528";
export const prices = [0.05, 0.1, 0.25, 0.5, 1, 2];
