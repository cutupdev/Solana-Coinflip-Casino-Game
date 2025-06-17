import { useState, useEffect } from "react";
import LoadingText from "./LoadingText";

export default function ProgressBar(props: {
  isEnd: boolean;
  isFetched: boolean;
  isWon: boolean;
  handlePlayAgain: Function;
}) {
  const { isEnd, isWon, isFetched, handlePlayAgain } = props;
  const [percent, setPercent] = useState(0);
  const [end, setEnd] = useState(false);
  useEffect(() => {
    if (isEnd) {
      setPercent(30);
    }
    if (isWon) {
      if (isFetched && isEnd) {
        setTimeout(() => {
          setPercent(100);
        }, 1000);

        setTimeout(() => {
          setEnd(true);
        }, 2000);
      }
    } else {
      setEnd(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnd, isFetched]);
  return (
    <>
      {!end && isWon && (
        <LoadingText
          text="Solana is processing your flip..."
          className="progressing"
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {!end && isWon && (
          <div className="progress-bar" style={{ marginTop: isWon ? 0 : 20 }}>
            <div
              className={`bar-line ${percent === 30 ? "half-bar" : ""}  ${
                percent === 100 ? "half-bar full-bar" : ""
              }`}
            ></div>
          </div>
        )}
        {isWon && end && (
          <p className="text-success">
            Your win sent successfully to your funds wallet.
          </p>
        )}
        <button
          className={`to-bet button white ${!end ? "loading" : ""}`}
          style={{ marginTop: 30, marginRight: "auto", marginLeft: "auto" }}
          disabled={!end}
          onClick={() => handlePlayAgain()}
        >
          <>PLAY AGAIN</>
        </button>
      </div>
    </>
  );
}
