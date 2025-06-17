import { useState, useEffect } from "react";

export default function LoadingText(props: {
  text: string;
  className?: string;
}) {
  const [textArray, setTextArray] = useState<string[]>([]);
  useEffect(() => {
    let array = [];
    for (let i = 0; i < props.text.length; i++) {
      array.push(props.text[i]);
    }
    setTextArray(array);
  }, [props.text]);
  return (
    <div className={`s3-loading  ${props.className ? props.className : ""}`}>
      {textArray.map((item, key) => (
        <span className={`s3-letter`} key={key}>
          {item}
        </span>
      ))}
    </div>
  );
}
