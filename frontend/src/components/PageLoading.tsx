import HashLoader from "react-spinners/HashLoader";

export default function PageLoading(props: { loading?: boolean }) {
  return (
    <>
      {props.loading && (
        <div className="con-loading">
          <div className="load">
            <div className="l1"></div>
            <div className="l2"></div>
            <div className="l3"></div>
            <div className="l4"></div>
          </div>
        </div>
      )}
    </>
  );
}

export const MiniLoading = () => {
  return (
    <div className="con-load">
      <div className="load">
        <div className="l1"></div>
        <div className="l2"></div>
        <div className="l3"></div>
        <div className="l4"></div>
      </div>
    </div>
  );
};
