/* eslint-disable @next/next/no-img-element */
import React from "react";

export default function Coin(props: {
  isHead: boolean;
  result?: boolean;
  className?: string;
}) {
  const { isHead, result, className } = props;
  return (
    <>
      {isHead ? (
        <img
          src="/img/head.png"
          alt=""
          className={`coin ${className ? className : ""} ${
            result ? "normal" : "lost"
          }`}
        />
      ) : (
        <img
          src="/img/tail.png"
          alt=""
          className={`coin ${className ? className : ""} ${
            result ? "" : "lost"
          }`}
        />
      )}
    </>
  );
}
