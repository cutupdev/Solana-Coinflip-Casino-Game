import { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MiniLoading } from "./PageLoading";
import { DepositIcon } from "./svgIcons";

export default function Header(props: {
  balance: number;
  userFunds: number;
  handleClaim: Function;
  wallet: WalletContextState;
  isClaiming: boolean;
  userLoading: boolean;
}) {
  const { userFunds, balance, userLoading, isClaiming, handleClaim, wallet } =
    props;
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {/* <p>
            Solana Network: <span>{solanaTps} TPS</span>
          </p> */}
          <a
              href="https://deezkits.com"
              rel="noreferrer"
          >
            <div className="logo">
                {/* eslint-disable-next-line */}
                <img src="/img/head.png" alt="" />
                <p>
                  {"{DEEZ}"}
                  <span>COIN</span>
                </p>
            </div>
          </a>
        </div>
        <div className="header-right">
          <div className="right-item">
            {wallet.publicKey && (
              <>
                <div className="player-funds">
                  <label>{!isClaiming ? "player funds" : "claiming..."}</label>
                  <p>
                    {userLoading ? "--" : userFunds.toLocaleString()}
                    <span>SOL</span>
                  </p>
                  <button
                    className="claim-button"
                    disabled={isClaiming}
                    onClick={() => handleClaim()}
                  >
                    <DepositIcon />
                    {isClaiming && <MiniLoading />}
                  </button>
                </div>
                <WalletMultiButton />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
