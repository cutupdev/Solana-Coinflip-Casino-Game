import database from "mongoose";
import { historyModel } from "./model/history_manager";

require('dotenv').config("../.env");
const DB_CONNECTION = process.env.DB_CONNECTION;

export const init = () => {
    if (DB_CONNECTION === undefined) return;
    database
    .connect(DB_CONNECTION)
    .then((v) => {
      console.log(`mongodb database connected`);
    })
    .catch((e) => {
      console.error(`mongodb error ${e}`);
    });
}

export const getData = async () => {
    let result = historyModel.find().sort({ _id: -1 }).limit(20);
    return result;
}

export const addTx = async (
    signature: string,
    address: string,
    type: number,
    bet_amount: number,
    block_hash: number,
    win: number,
) => {
    try {
        const newData = new historyModel({  
            address: address,
            signature : signature,
            type : type,
            bet_amount: bet_amount,
            block_hash: block_hash,
            win : win,
        });
        newData.save(function (err, book) {
            if (err) return console.error(err);
            console.log(newData, "Saved successful");
        })
    } catch (error) {
        console.error('error!')
    }
}
