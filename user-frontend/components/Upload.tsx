"use client";
import { PublicKey, SystemProgram, Transaction , Commitment} from '@solana/web3.js';
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { log } from 'console';

export const Upload = () => {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [txSignature, setTxSignature] = useState("");
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const { connection } = useConnection();
    const router = useRouter();
    

    async function onSubmit() {
        const response = await axios.post(`${BACKEND_URL}/v1/user/task`, {
            options: images.map(image => ({
                imageUrl: image,
            })),
            title,
            signature: txSignature
        }, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        })

        router.push(`/task/${response.data.id}`)
    }






    // Try for Payment gateway
    async function sendAndConfirmTransactionWithRetry(
        connection: ReturnType<typeof useConnection>["connection"],
        transaction: Transaction,
        wallet: { publicKey: PublicKey | null; signTransaction?: (tx: Transaction) => Promise<Transaction> },
        commitment: Commitment = "confirmed",
        maxRetries: number = 3
      ): Promise<string> {
        let retries = 0;
      
        while (retries < maxRetries) {
          try {
            // Fetch a fresh blockhash before signing the transaction
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(commitment);
            transaction.recentBlockhash = blockhash;
      
            if (!wallet.publicKey) {
              throw new Error("Wallet is not connected.");
            }
      
            // Set feePayer
            transaction.feePayer = wallet.publicKey;
      
            if (!wallet.signTransaction) {
              throw new Error("Wallet does not support transaction signing.");
            }
      
            console.log("Signing transaction...");
            const signedTransaction = await wallet.signTransaction(transaction);
      
            console.log("Sending transaction...");
            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
              skipPreflight: false, // Set to false to validate before sending
            });
      
            console.log("Confirming transaction...");
            const confirmation = await connection.confirmTransaction(
              { signature, blockhash, lastValidBlockHeight },
              commitment
            );
      
            console.log("Transaction successful:", signature, confirmation);
            return signature;
          } catch (error: unknown) {
            if (error instanceof Error) {
              console.error(`Attempt ${retries + 1} failed:`, error.message);
              if (error.message.includes("block height exceeded")) {
                console.log("Refreshing blockhash and retrying...");
              }
            }
      
            retries++;
      
            if (retries >= maxRetries) {
              throw new Error("Transaction failed after maximum retries.");
            }
          }
        }
      
        throw new Error("Transaction failed after retries.");
      }









    //end of try for peyment gateway


    async function makePayment() {

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey!,
                toPubkey: new PublicKey("96KGw5STZpSBU7mpFFo3EHgZLksHMmjNEMnxMouFoCA8"),
                //toPubkey: new PublicKey("2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq"),
                lamports: 100000000,
            })
        );

        try{
            const signature = await sendAndConfirmTransactionWithRetry(
                connection,
                transaction,
                { publicKey,signTransaction },
                "confirmed",
                3
              );

              
              setTxSignature(signature);
              console.log("Valueof signature:" , signature);
              
        
              console.log("Transaction confirmed:", signature);
            } catch (error : unknown) {
                if (error instanceof Error) {
                    console.error("Transaction failed:", error.message, error.stack);
                 } else {
                    console.error("An unknown error occurred:", error);
                 }
            }

        // const {
        //     context: { slot: minContextSlot },
        //     value: { blockhash, lastValidBlockHeight }
        // } = await connection.getLatestBlockhashAndContext();

        //const signature = await sendTransaction(transaction, connection, { minContextSlot });

        //await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature },"processed");
        //setTxSignature(signature);
    }

    return <div className="flex justify-center">
        <div className="max-w-screen-lg w-full">
            <div className="text-2xl text-left pt-20 w-full pl-4">
                Create a task
            </div>

            <label className="pl-4 block mt-2 text-md font-medium text-gray-900 text-black">Task details</label>

            <input onChange={(e) => {
                setTitle(e.target.value);
            }} type="text" id="first_name" className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="What is your task?" required />

            <label className="pl-4 block mt-8 text-md font-medium text-gray-900 text-black">Add Images</label>
            <div className="flex justify-center pt-4 max-w-screen-lg">
                {images.map((image,index) => <UploadImage  key={index} image={image} onImageAdded={(imageUrl) => {
                    setImages(i => [...i, imageUrl]);
                }} />)}
            </div>

        <div className="ml-4 pt-2 flex justify-center">
            <UploadImage onImageAdded={(imageUrl) => {
                setImages(i => [...i, imageUrl]);
            }} />
        </div>

        <div className="flex justify-center">
            <button onClick={txSignature ? onSubmit : makePayment} type="button" className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                {txSignature ? "Submit Task" : "Pay 0.1 SOL"}
            </button>
        </div>
        
      </div>
    </div>
}