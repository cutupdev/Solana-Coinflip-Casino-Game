import "../styles/style.scss";
import Wallet from "../components/wallet/Wallet";
import { ToastContainer } from "react-toastify";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

function RaffleApp({ Component, pageProps }) {
  return (
    <Wallet>
      <WalletModalProvider>
        <Component
          {...pageProps}
          startLoading={() => setLoading(true)}
          closeLoading={() => setLoading(false)}
        />
        <ToastContainer style={{ fontSize: 14 }} />
      </WalletModalProvider>
    </Wallet>
  );
}

export default RaffleApp;
