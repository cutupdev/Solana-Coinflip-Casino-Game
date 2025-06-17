import moment from "moment";
import { useState, useEffect } from "react";
import { solConnection } from "../contexts/utils";
import { SolGrayIcon, SolIcon, SolSvgIcon } from "./svgIcons";

export default function HistoryItem(props: {
  signature: string;
  hash: number;
  userAddress: string;
  betAmount: number;
  type: boolean;
  betTime: number;
  win: boolean;
}) {
  const { win, signature, userAddress, hash, betAmount, type, betTime } = props;
  const [blockTime, setBlockTime] = useState(new Date().getTime());
  const [timeLoading, setTimeLoading] = useState(false);
  const getBlockTime = async () =>
  {
    setTimeLoading(true);
    try
    {
      const slot = await solConnection.getSlot();
      const time = await solConnection.getBlockTime(slot);
      if (time)
      {
        setBlockTime(time * 1000);
      }
    }
    catch (e) {
    }
    setTimeLoading(false);
  };

  useEffect(() => {
    getBlockTime();
    // eslint-disable-next-line
  }, [betTime]);

  return (
    <div className={`${win ? "win" : ""} win-item`}>
      <a
        target="_blank"
        href={`https://solscan.io/tx/${signature}?cluster=devnet`}
        title={userAddress}
        className="walletx"
        rel="noreferrer"
      >
        <span className="sub-wallet">
          {`${userAddress.slice(0, 4)}...${userAddress.slice(-4)}`}
        </span>
        bet{" "}{type ? "HEADS" :"TAILS"}
        <span className="sub-token">
          <SolSvgIcon />
          &nbsp;{betAmount} SOL
        </span>
        and
        <span className={win ? "doubled" : "lost"}>{win ? "Won" : "Lost"}</span>
      </a>
      <div className="slotx">
        {/*stamp:{""}*/}
        {/*{betTime}*/}
      </div>
      <div className={`${win ? "COLOR2" : "COLOR1"} colorx`}></div>
      <div className={`solx ${win ? "win" : "lost"}`}>
        {win ? "+" : "-"} {win ? betAmount*2 : betAmount} SOL
      </div>
      {!timeLoading && (
        <div className="timex">
          {/* {moment(betTime * 1000 - 60 * 1000).fromNow()} */}
          {moment(betTime * 1000).from(moment(blockTime))}
        </div>
      )}
    </div>
  );
}
