import { useEffect, useState } from "react";

export default function CoinFlipping(props: { heads: boolean; end?: boolean }) {
  const [coinAnimation, setCoinAnimation] = useState("");
  const handleFlip = () => {
    setTimeout(function timer() {
      setCoinAnimation("none");
      if (props.heads) {
        setTimeout(function () {
          setCoinAnimation("spin-head 0.2s infinite");
        }, 100);
      } else {
        setTimeout(function () {
          setCoinAnimation("spin-tail 0.2s infinite");
        }, 100);
      }
    }, 100);
  };
  useEffect(() => {
    handleFlip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.heads, props.end]);

  return (
    <div className="coin-flipping" style={{ animation: coinAnimation }}>
      {/* eslint-disable-next-line */}
      <img src="/img/head.png" alt="heads" className="side-heads" />
      {/* eslint-disable-next-line */}
      <img src="/img/tail.png" alt="tails" className="side-tails" />
    </div>
  );
}
