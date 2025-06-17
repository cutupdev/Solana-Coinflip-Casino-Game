/* eslint-disable @next/next/no-img-element */
import Skeleton from "@mui/material/Skeleton";
import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import Coin from "../components/Coin";
import CoinFlipping from "../components/CoinFlipping";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HistoryItem from "../components/HistoryItem";
import LoadingText from "../components/LoadingText";
import { MiniLoading } from "../components/PageLoading";
import ProgressBar from "../components/ProgressBar";
import { QuotLeft, QuotRight, SolSvgIcon } from "../components/svgIcons";
import { errorAlert } from "../components/toastGroup";
import { CF_VERSION, prices, PROGRAM_ID } from "../constants";
import { claim, getAllTransactions, getBankBalance, getGlobalState, getUserFundsBalanceSOL, getUserPoolState, playGame } from "../contexts/transactions";
import { HistoryItem as HistoryItemType } from "../contexts/type";
import { getNetworkFromConnection, getSolbalance, postWinOrLoseToDiscordAPI, solConnection } from "../contexts/utils";

const Home: NextPage = () =>
{
    const anchorWallet = useAnchorWallet() as anchor.Wallet;
    const wallet = useWallet();
    const [isBet, setIsBet] = useState(true);
    const [amount, setAmount] = useState(0.05);
    const [userLoading, setUserLoading] = useState(false);
    const [solBalance, setSolBanace] = useState(0);
    const [betLoading, setBetLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);

    const [isDepositing, setIsDepositing] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [setValue, setSetValue] = useState(0.05);
    const [userFunds, setUserFunds] = useState(0);
    const [txLoading, setTxLoading] = useState(false);
    const [isStartFlipping, setIsStartFlipping] = useState(false);

    const [isInc, setIsInc] = useState(false);
    const [isDec, setIsDec] = useState(false);

    const [isProgress, setIsProgress] = useState(false);
    const [txHistory, setTxHistory] = useState<HistoryItemType[]>([]);
    const getGlobalData = async () =>
    {
        setIsDec(false);
        setUserLoading(true);
        if (wallet.publicKey !== null)
        {
            console.log("Connection:", getNetworkFromConnection(solConnection));

            const globalState = await getGlobalState(anchorWallet);
            console.log("Global State:", globalState);

            const balance = await getSolbalance(wallet.publicKey);
            const funds = await getUserPoolState(anchorWallet);
            const bankBalance = await getBankBalance(anchorWallet);
            console.log("Bank Balance: ", bankBalance / LAMPORTS_PER_SOL,);

            if (funds)
            {
                setUserFunds(funds.earnedMoney.toNumber() / LAMPORTS_PER_SOL);
            }

            setSolBanace(balance);
            console.log("Player Balance:", balance)

            const userFundsBalanceBeforeWithdrawal = await getUserFundsBalanceSOL(anchorWallet);
            console.log("Player Funds Balance:", userFundsBalanceBeforeWithdrawal)
        }

        setUserLoading(false);
    };

    const getAllTxs = async () =>
    {
        setTxLoading(true);
        //const bankBalance = await getBankBalance();
        //console.log("Bank Balance: ", bankBalance / LAMPORTS_PER_SOL);
        if (wallet.publicKey !== null)
        {
            const allTx = await getAllTransactions(new PublicKey(PROGRAM_ID));
            console.log(allTx);
            setTxHistory(allTx);
        }
        setTxLoading(false);
    };

    const updatePage = async () =>
    {
        await getGlobalData();
        await getAllTxs();
    };

    const getDataByInterval = async () =>
    {
        // setInterval(async () => {
        //   if (wallet.publicKey === null) return;
        //   const balance = await getSolbalance(wallet.publicKey);
        //   const allTx = await getAllTransactions(new PublicKey(PROGRAM_ID));
        //   const funds = await getUserPoolState(wallet);
        //   if (funds) {
        //     setUserFunds(funds.claimableReward.toNumber() / LAMPORTS_PER_SOL);
        //   }
        //   setTxHistory(allTx);
        //   setSolBanace(balance);
        // }, 5000);
    };

    const handlePlayAgain = () =>
    {
        setIsEnd(false);
        setIsWon(false);
        setIsProgress(false);
        setIsDec(false);
        setIsStartFlipping(false);
    };

    const setPlayResult = (isWon: boolean) =>
    {
        setIsWon(isWon);
        console.log("IsWon:", isWon);

        postWinOrLoseToDiscordAPI(wallet!.publicKey!, isWon, amount, solConnection);
    }

    const handlePlay = async () =>
    {
        if (wallet.publicKey === null)
        {
            errorAlert("Please connect wallet!");
            return;
        }
        if (amount + 0.002 > solBalance)
        {
            errorAlert("You don't have enough balance to play!");
            return;
        }

        if (amount + 0.002 > await getSolbalance(wallet.publicKey))
        {
            errorAlert("You don't have enough balance to play!");
            return;
        }

        try
        {
            const result = await playGame(
                anchorWallet,
                isBet ? 1 :0,
                amount,
                (e: boolean) => setBetLoading(e),
                (e: boolean) => setIsDepositing(e),
                (e: boolean) => setIsFlipping(e),
                (e: boolean) => setIsEnd(e),
                (e: boolean) => setIsProgress(e),
                (e: boolean) => setIsDec(e),
                (e: boolean) => setIsInc(e),
                (e: boolean) => setPlayResult(e),
                (e: boolean) => setIsStartFlipping(e),
                () => getAllTxs()
            );

            console.log("playGame result:", result);

            if (result && result.rewardAmount !== 0)
            {
                setSetValue(prices[result.betAmount]);
            }

            await getGlobalData();
        }
        catch (error)
        {
            setIsEnd(false);
            setIsWon(false);
            console.log(error);
        }
    };

    const [forceRender, serForceRender] = useState(false);
    const decWalletBalance = (value: number) =>
    {
        let balance = solBalance;
        setSolBanace(balance - value);
        serForceRender(!forceRender);
    };

    const incFundsBalance = (value: number) =>
    {
        let balance = userFunds;
        setUserFunds(balance + value);
        serForceRender(!forceRender);
    };

    useEffect(() =>
    {
        if (isDec)
        {
            decWalletBalance(amount);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDec]);

    useEffect(() =>
    {
        if (isWon)
        {
            setTimeout(() =>
            {
                incFundsBalance(amount * 2);
            }, 3000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWon, isInc]);

    const handleClaim = async () =>
    {
        if (wallet.publicKey === null)
        {
            errorAlert("Please connect wallet!");
            return;
        }

        if (userFunds === 0)
        {
            errorAlert("No funds available for withdrawal!");
            return;
        }

        try
        {
            await claim(
                anchorWallet,
                () => setClaimLoading(true),
                () => setClaimLoading(false),
                () => handlePlayAgain(),
                () => updatePage()
            );

            setIsEnd(false);
        }
        catch (error)
        {
            console.log(error);
        }
    };

    let prevState = useRef(wallet.connected);
    useEffect(() =>
    {
        if (prevState.current != wallet.connected)
        {
            prevState.current = wallet.connected;
            console.log("CF Ver:", CF_VERSION);

            getGlobalData();
            getAllTxs();
            getDataByInterval();
        }
        // eslint-disable-next-line
    }, [wallet.connected, wallet.publicKey]);


    return (
        <div className="main-page">
            <Header
                balance={solBalance}
                wallet={wallet}
                userFunds={userFunds}
                handleClaim={handleClaim}
                isClaiming={claimLoading}
                userLoading={userLoading}
            />
            <main>
                {wallet.publicKey && (
                    <div className="player-funds one-fund">
                        <SolSvgIcon/>
                        <p>
                            {userLoading ? "--" :solBalance.toLocaleString()}
                            <span>SOL</span>
                        </p>
                    </div>
                )}
                {isEnd && (
                    <div className="win-effect">
                        {isWon && <Confetti width={2000} height={2000}/>}
                    </div>
                )}
                <div className="container">
                    <div className="main-content">
                        {isProgress ? (
                            <div className="flip-box-progress">
                                {isFlipping ? (
                                    <CoinFlipping heads={isBet}/>
                                ) :(
                                    <>
                                        {isEnd ? (
                                            <Coin
                                                isHead={isWon === isBet}
                                                result={isWon || !isProgress}
                                                className="coin-animation"
                                            />
                                        ) :(
                                            <Coin isHead={isBet} className="coin-animation"/>
                                        )}
                                    </>
                                )}
                                {isEnd ? (
                                    <>
                                        {isWon ? (
                                            <>
                                                <p className="result-text won">YOU WON</p>
                                                <p className="result-value won">{amount * 2} SOL</p>
                                            </>
                                        ) :(
                                            <>
                                                <p className="result-text lost">YOU LOST</p>
                                                <p className="result-value lost">{amount} SOL</p>
                                            </>
                                        )}

                                        <ProgressBar
                                            isEnd={isEnd}
                                            isFetched={!userLoading}
                                            handlePlayAgain={handlePlayAgain}
                                            isWon={isWon}
                                        />
                                    </>
                                ) :(
                                    <>
                                        {isDepositing && !isFlipping && (
                                            <LoadingText
                                                text="waiting for deposit..."
                                                className="waiting"
                                            />
                                        )}
                                        {isFlipping && (
                                            <LoadingText text="Flipping..." className="waiting"/>
                                        )}

                                        <h4>
                                            <QuotLeft/>
                                            {isBet ? "HEADS" :"TAILS"}{" "}
                                            <span className="text-purple">FOR</span>{" "}
                                            <span className="text-yellow">{amount}</span> SOL
                                            <QuotRight/>
                                        </h4>
                                    </>
                                )}
                            </div>
                        ) :(
                            <>
                                <div className="flip-box">
                                    <div className="coins">
                                        {isBet ? (
                                            // eslint-disable-next-line
                                            <img src="/img/head.png" alt=""/>
                                        ) :(
                                            // eslint-disable-next-line
                                            <img src="/img/tail.png" alt=""/>
                                        )}
                                    </div>
                                    <p className="bet-on-title">I BET ON</p>
                                    <div className="bet-selecte">
                                        <div className={`coin-box`} onClick={() => setIsBet(true)}>
                                            {/* eslint-disable-next-line */}
                                            <img src="/img/head@sm.png" alt=""/>
                                            <p className={`${isBet ? "text-green" :"text-purple"}`}>
                                                HEADS
                                            </p>
                                        </div>
                                        <div className={`coin-box`} onClick={() => setIsBet(false)}>
                                            {/* eslint-disable-next-line */}
                                            <img src="/img/tail@sm.png" alt=""/>
                                            <p className={`${!isBet ? "text-green" :"text-purple"}`}>
                                                TAILS
                                            </p>
                                        </div>
                                    </div>
                                    <p className="bet-on-title">FOR</p>
                                    {wallet.publicKey === null ? (
                                        <WalletModalButton/>
                                    ) : (
                                        <div className="place-bet">
                                            <div className="bet-content">
                                                <button
                                                    onClick={() => setAmount(0.05)}
                                                    disabled={solBalance <= 0.05}
                                                    className={`btn-sol ${
                                                        amount === 0.05 ? "active" :""
                                                    }`}
                                                >
                                                    <span>0.05 SOL</span>
                                                </button>
                                                <button
                                                    onClick={() => setAmount(0.1)}
                                                    disabled={solBalance <= 0.1}
                                                    className={`btn-sol ${
                                                        amount === 0.1 ? "active" :""
                                                    }`}
                                                >
                                                    <span>0.1 SOL</span>
                                                </button>
                                                <button
                                                    onClick={() => setAmount(0.25)}
                                                    disabled={solBalance <= 0.25}
                                                    className={`btn-sol ${
                                                        amount === 0.25 ? "active" :""
                                                    }`}
                                                >
                                                    <span>0.25 SOL</span>
                                                </button>
                                                <button
                                                    onClick={() => setAmount(0.5)}
                                                    disabled={solBalance <= 0.5}
                                                    className={`btn-sol ${
                                                        amount === 0.5 ? "active" :""
                                                    }`}
                                                >
                                                    <span>0.5 SOL</span>
                                                </button>
                                                <button
                                                    onClick={() => setAmount(1)}
                                                    disabled={solBalance <= 1}
                                                    className={`btn-sol ${amount === 1 ? "active" :""}`}
                                                >
                                                    <span>1 SOL</span>
                                                </button>
                                                <button
                                                    onClick={() => setAmount(2)}
                                                    disabled={solBalance <= 2}
                                                    className={`btn-sol ${amount === 2 ? "active" :""}`}
                                                >
                                                    <span>2 SOL</span>
                                                </button>
                                            </div>
                                            <div className="action">
                                                <button
                                                    className={`to-bet button white ${
                                                        betLoading ? "load-active" :""
                                                    }  ${userLoading ? "loading" :""}`}
                                                    title={
                                                        solBalance <= amount + 0.002 ? "No enough SOL" :""
                                                    }
                                                    disabled={betLoading}
                                                    onClick={() => handlePlay()}
                                                >
                                                    <>Double or nothing</>
                                                    {betLoading && <MiniLoading/>}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="leaderboard">
                                    <h2 className="h2-plays">RECENT PLAYS (last 10 Txs)</h2>
                                    {!txLoading && !isProgress ? (
                                        <>
                                            {txHistory && txHistory.length !== 0 && (
                                                <div className="con-plays">
                                                    {txHistory.map((item, key) => (
                                                        <HistoryItem
                                                            key={key}
                                                            signature={item.signature}
                                                            hash={item.block_hash}
                                                            userAddress={item.address}
                                                            type={item.type === 1}
                                                            betTime={item.block_timestamp}
                                                            win={item.win === 1}
                                                            betAmount={item.bet_amount / LAMPORTS_PER_SOL}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) :(
                                        <>
                                            <div className="con-plays">
                                                {[1, 2, 3, 4].map((item, key) => (
                                                    <Skeleton
                                                        key={key}
                                                        variant="rectangular"
                                                        style={{
                                                            width: "100%",
                                                            borderRadius: 9,
                                                            background: "#1e1f1e60",
                                                            height: 56,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer/>
            {/* <PageLoading loading={userLoading && !isProgress} /> */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/smoke-1.png" className="smoke smoke-1" alt=""/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/smoke-2.png" className="smoke smoke-2" alt=""/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/smoke-3.png" className="smoke smoke-3" alt=""/>
        </div>
    );
};

export default Home;
