import * as anchor from '@project-serum/anchor';
import * as splToken from '@solana/spl-token';
import { IDL, PROGRAM_ID, SOLANA_HOST } from './const';

export const WRAPPED_SOL_MINT = splToken.NATIVE_MINT;
export const connection = new anchor.web3.Connection(SOLANA_HOST);
export const LAMPORTS_PER_SOL = anchor.web3.LAMPORTS_PER_SOL;

export const defaultAccounts = {
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
};

export const TREASURY_TAG = Buffer.from("coin-flip-treasury");
export const VAULT_TAG = Buffer.from("coin-flip-vault");
export const USER_TREASURY_TAG = Buffer.from("coin-flip-user-treasury");

let program = null;
let currentWallet = null;

export function initCoinFlipProgram(
  wallet,
) {
    let result = { success: true, data: null, msg: "" };
    try {
        const provider = new anchor.Provider(
            connection,
            wallet,
            anchor.Provider.defaultOptions(),
        );
        program = new (anchor).Program(IDL, PROGRAM_ID, provider);
        currentWallet = wallet;
    } catch(e) {
        result.success = false;
        result.msg = e.message;
    } finally {
        return result;
    }
}

export const createTreasury = async (
    signer = currentWallet.publicKey,
    signers = [],
) => {
    let result = { success: true, data: null, msg: "" };

    try {
        const tradeTreasury = await pda([TREASURY_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId)
        const tradeVault = await pda([VAULT_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);
        const transaction = new anchor.web3.Transaction();

        transaction.add(
            program.instruction.createTreasury({
                accounts: {
                    tradeTreasury: tradeTreasury,
                    tradeMint: WRAPPED_SOL_MINT,
                    tradeVault: tradeVault,
                    authority: signer,
                    ...defaultAccounts
                }
            })
        );
        const tx = await program.provider.send(transaction, [...signers]);

        console.log("tx= ", tx);
        result.msg = "successfully created treasury.";
    } catch(e) {
        result.success = false;
        result.msg = e.message;
    } finally {
        return result;
    }
}

export const claimPlatformReward = async (
    signer = currentWallet.publicKey,
    signers = [],
) => {
    let result = { success: true, data: null, msg: "" };

    try {
        const tradeTreasury = await pda([TREASURY_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId)
        const tradeVault = await pda([VAULT_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);

        const WSOLTokenAccount = new anchor.web3.Account();
        const transaction = new anchor.web3.Transaction();

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: signer,
                lamports: 2.04e6,
                newAccountPubkey: WSOLTokenAccount.publicKey,
                programId: splToken.TOKEN_PROGRAM_ID,
                space: 165,
            }),
            splToken.createInitializeAccountInstruction(
                WSOLTokenAccount.publicKey,
                WRAPPED_SOL_MINT,
                signer,
            ),
            program.instruction.claimTreasury({
                accounts: {
                    tradeTreasury: tradeTreasury,
                    tradeMint: WRAPPED_SOL_MINT,
                    tradeVault: tradeVault,
                    userVault: WSOLTokenAccount.publicKey,
                    authority: signer,
                    ...defaultAccounts
                }
            }),
            splToken.createCloseAccountInstruction(
                WSOLTokenAccount.publicKey,
                signer,
                signer,
            ),
        );
        const tx = await program.provider.send(transaction, [WSOLTokenAccount, ...signers]);

        console.log("tx= ", tx);
        result.msg = "successfully claimed platform fee.";
    } catch(e) {
        result.success = false;
        result.msg = e.message;
    } finally {
        return result;
    }
}

export const processGame = async (
    amount = 0,
    isHead = true,
    isSpin = true,
    signer = currentWallet.publicKey,
    signers = [],
) => {
    let result = { success: true, data: null, msg: "" };

    try {
        const tradeTreasury = await pda([TREASURY_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId)
        const tradeVault = await pda([VAULT_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);
        const userTreasury = await pda([USER_TREASURY_TAG, signer.toBuffer(), WRAPPED_SOL_MINT.toBuffer()], program.programId);
        const rent = await splToken.getMinimumBalanceForRentExemptAccount(connection)
        const WSOLTokenAccount = new anchor.web3.Account();
        const transaction = new anchor.web3.Transaction();
        
        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: signer,
                lamports: amount + rent,
                newAccountPubkey: WSOLTokenAccount.publicKey,
                programId: splToken.TOKEN_PROGRAM_ID,
                space: splToken.AccountLayout.span,
            }),
            splToken.createInitializeAccountInstruction(
                WSOLTokenAccount.publicKey,
                WRAPPED_SOL_MINT,
                signer,
                splToken.TOKEN_PROGRAM_ID
            ),
            program.instruction.processGame(new anchor.BN(amount), isHead, isSpin, {
                accounts: {
                    tradeTreasury: tradeTreasury,
                    tradeMint: WRAPPED_SOL_MINT,
                    tradeVault: tradeVault,
                    userTreasury: userTreasury,
                    userVault: WSOLTokenAccount.publicKey,
                    authority: signer,
                    ...defaultAccounts
                },
            }),
            splToken.createCloseAccountInstruction(
                WSOLTokenAccount.publicKey,
                signer,
                signer,
            ),
        );
        console.log(transaction)

        const tx = await program.provider.send(transaction, [WSOLTokenAccount, ...signers]);

        console.log("tx= ", tx);
        result.msg = "successfully processGame.";
    } catch(e) {
        result.success = false;
        result.msg = e.message;
    } finally {
        return result;
    }
}

export const claimUserReward = async (
    signer = currentWallet.publicKey,
    signers = [],
) => {
    let result = { success: true, data: null, msg: "" };

    try {
        const tradeTreasury = await pda([TREASURY_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId)
        const tradeVault = await pda([VAULT_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);
        const userTreasury = await pda([USER_TREASURY_TAG, signer.toBuffer(), WRAPPED_SOL_MINT.toBuffer()], program.programId);
        const rent = await splToken.getMinimumBalanceForRentExemptAccount(connection)
        console.log(tradeVault.toString())
        const WSOLTokenAccount = new anchor.web3.Account();
        const transaction = new anchor.web3.Transaction();

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: signer,
                lamports: 2.04e6,
                newAccountPubkey: WSOLTokenAccount.publicKey,
                programId: splToken.TOKEN_PROGRAM_ID,
                space: 165,
            }),
            splToken.createInitializeAccountInstruction(
                WSOLTokenAccount.publicKey,
                WRAPPED_SOL_MINT,
                signer,
            ),
            program.instruction.claim({
                accounts: {
                    tradeTreasury: tradeTreasury,
                    tradeMint: WRAPPED_SOL_MINT,
                    tradeVault: tradeVault,
                    userTreasury: userTreasury,
                    userVault: WSOLTokenAccount.publicKey,
                    authority: signer,
                    ...defaultAccounts
                },
            }),
            splToken.createCloseAccountInstruction(
                WSOLTokenAccount.publicKey,
                signer,
                signer,
            ),
        );

        const tx = await program.provider.send(transaction, [WSOLTokenAccount, ...signers]);

        console.log("tx= ", tx);
        result.msg = "successfully claimed reward";
    } catch(e) {
        result.success = false;
        result.msg = e.message;
    } finally {
        return result;
    }
}

export const getUserTreasuryAccount = async () => {
    const userTreasury = await pda([USER_TREASURY_TAG, currentWallet.publicKey.toBuffer(), WRAPPED_SOL_MINT.toBuffer()], program.programId);
    const userTreasuryAccountData = await program.account.userTreasury.fetchNullable(userTreasury);
    return userTreasuryAccountData;
}

export const isSuperOwner = async () => {
    const tradeTreasury = await pda([TREASURY_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);
    const tradeTreasuryData = await program.account.tradeTreasury.fetchNullable(tradeTreasury);
    if (!tradeTreasuryData || (currentWallet?.publicKey && tradeTreasuryData.superOwner.toString() == currentWallet?.publicKey.toString())) return true;
    return false;
}

export const depositToVault = async (
    amount,
    signer = currentWallet.publicKey,
    signers = [],
) => {
    let result = { success: true, data: null, msg: "" };
    try {
        const tradeVault = await pda([VAULT_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);
        const WSOLTokenAccount = new anchor.web3.Account();
        const transaction = new anchor.web3.Transaction();

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: signer,
                lamports: amount + 2.04e6,
                newAccountPubkey: WSOLTokenAccount.publicKey,
                programId: splToken.TOKEN_PROGRAM_ID,
                space: 165,
            }),
            splToken.createInitializeAccountInstruction(
                WSOLTokenAccount.publicKey,
                WRAPPED_SOL_MINT,
                signer,

            ),
            splToken.createTransferInstruction(
                WSOLTokenAccount.publicKey,
                tradeVault,
                signer,
                amount,
            ),
            splToken.createCloseAccountInstruction(
                WSOLTokenAccount.publicKey,
                signer,
                signer,
            ),
        );

        const tx = await program.provider.send(transaction, [WSOLTokenAccount, ...signers]);

        console.log("tx= ", tx);
        result.msg = "successfully claimed reward";
    } catch(e) {
        result.success = false;
        result.msg = e.message;
    } finally {
        return result;
    }
}

export const getValutAmount = async () => {
    const tradeTreasury = await pda([TREASURY_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);
    const tradeTreasuryData = await program.account.tradeTreasury.fetchNullable(tradeTreasury);
    const tradeVault = await pda([VAULT_TAG, WRAPPED_SOL_MINT.toBuffer()], program.programId);
    
    if(!tradeTreasuryData) return {amount: 0, decimals: 9};
    const tradeVaultAmount = await connection.getTokenAccountBalance(tradeVault);
    console.log(tradeVaultAmount)
    return {amount:tradeVaultAmount.value.amount, decimals: tradeVaultAmount.value.decimals};
}

export const pda = async (
    seeds,
    programId,
  ) => {
    const [pdaKey] = await anchor.web3.PublicKey.findProgramAddress(
      seeds,
      programId
    );
    return pdaKey;
  }