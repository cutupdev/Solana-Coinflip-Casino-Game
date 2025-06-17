import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
    Connection,
    PublicKey
} from '@solana/web3.js';
import { Server } from 'socket.io';
import { performTx, sleep } from './script';
import { getData } from './db';


export const SOLANA_NETWORK = "https://delicate-withered-theorem.solana-devnet.quiknode.pro/0399d35b8b5de1ba358bd014f584ba88d7709bcf/";
export const solConnection = new Connection(SOLANA_NETWORK, "confirmed");
export const PROGRAM_ID = "D7gqVkb2mTcEsoCDUB9ZjFA6Z5uN2MmwahwRRWjFgR3G";

const app = express();
const port = process.env.PORT || 3002;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

server.listen(port, () => {
    console.log(`server is listening on ${port}`);
    attachRewardTransactionListener(io);
    return;
  });


const attachRewardTransactionListener = async (io: Server) => {
    const connection = new Connection(SOLANA_NETWORK, "confirmed");
  
    const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from("vault-authority")],
      new PublicKey(PROGRAM_ID)
    );
    console.log(rewardVault.toBase58())
  
  
    connection.onLogs(rewardVault, async (logs, ctx) => {
      var sign = logs.signature;
      if (sign === '1111111111111111111111111111111111111111111111111111111111111111') return;
  
      console.log("changed")
      var testtxs = await connection.getParsedTransaction(sign, 'finalized');
      do {
        if (testtxs === null) {
          await sleep(3000);
          console.log('catching transaction retry... for sig: ', sign, '>>>>>>>>>', testtxs);
          testtxs = await connection.getParsedTransaction(sign, 'finalized');
        } else {
          break;
        }
  
      } while (true);
    
      await performTx(sign);

      const result = await getData();


      io.emit('update_status', result);
  
      // sigs = [];
  
      // }
    });
  
  }
  