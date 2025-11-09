"use client";

import { useState, useEffect } from "react";
import { logTestTransaction } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { CopySimple, LockSimple } from "phosphor-react";

const generateFakeAddress = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateFakeSignature = () => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 128; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateCommitment = (secret: string) => {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    const index = (secret.charCodeAt(i % secret.length) + i) % chars.length;
    result += chars.charAt(index);
  }
  return result;
};

interface Transaction {
  id?: string;
  sender: string;
  recipient: string;
  amount: number;
  signature: string;
  isPrivate: boolean;
  status: string;
  commitment?: string;
  nullifier?: string;
  timestamp?: any;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-gray-100 rounded cursor-pointer"
      title="Copy"
    >
      <CopySimple size={12} weight="bold" />
    </button>
  );
};

export default function PrivacyDemo() {
  const { authenticated, user } = usePrivy();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1.0");
  const [isPrivate, setIsPrivate] = useState(true);
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const userAddress = user?.linkedAccounts?.find(account => account.type === 'wallet')?.address || "";

  useEffect(() => {
    const q = query(
      collection(db, 'test_transactions'),
      orderBy('timestamp', 'desc'),
      limit(15)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setRecentTransactions(txs);
    });

    return () => unsubscribe();
  }, []);

  const handleSendTransaction = async () => {
    if (!authenticated) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!recipient || !amount) {
      setStatus("Please fill in recipient and amount");
      return;
    }

    if (isPrivate && !secret) {
      setStatus("Secret is required for private transactions");
      return;
    }

    setStatus("Processing transaction...");

    const signature = generateFakeSignature();
    
    const txData: any = {
      sender: userAddress,
      recipient: recipient,
      amount: parseFloat(amount),
      signature: signature,
      isPrivate: isPrivate,
      status: 'confirmed'
    };

    if (isPrivate && secret) {
      txData.commitment = generateCommitment(secret);
      txData.nullifier = generateFakeSignature().slice(0, 64);
    }

    try {
      await logTestTransaction(txData);

      setStatus("Transaction sent successfully!");
      
      setTimeout(() => {
        setRecipient("");
        setAmount("1.0");
        setSecret("");
        setStatus("");
      }, 3000);

    } catch (error) {
      setStatus("Failed to send transaction");
      console.error(error);
    }
  };

  const generateRandomRecipient = () => {
    setRecipient(generateFakeAddress());
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="grid lg:grid-cols-[340px_1fr] gap-4">
        {/* LEFT: Send Transaction */}
        <div className="border border-gray-300 p-4">
          <h2 className="text-lg font-bold text-black mb-4">send transaction</h2>
          
          <div className="space-y-3">
            {authenticated && userAddress && (
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  your address
                </label>
                <div className="border border-gray-300 px-2 py-1.5 bg-white flex items-center justify-between">
                  <code className="text-[10px] text-black font-mono truncate flex-1">
                    {userAddress.slice(0, 16)}...{userAddress.slice(-8)}
                  </code>
                  <CopyButton text={userAddress} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                recipient
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="address..."
                disabled={!authenticated}
                className="w-full px-2 py-1.5 border border-gray-300 text-black font-mono text-[10px] focus:outline-none focus:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={generateRandomRecipient}
                disabled={!authenticated}
                className="mt-1 w-full px-2 py-1.5 bg-gray-100 border border-gray-300 text-black text-xs font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                generate random
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                amount (SOL)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!authenticated}
                className="w-full px-2 py-1.5 border border-gray-300 text-black text-base focus:outline-none focus:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="border border-gray-300 p-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  disabled={!authenticated}
                  className="w-3 h-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="private" className={`text-xs font-bold text-black ${!authenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center gap-1`}>
                  <LockSimple size={14} weight="bold" className="text-orange-600" />
                  private transaction
                </label>
              </div>
            </div>

            {isPrivate && (
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  secret (required for shielding)
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="enter secret..."
                  maxLength={64}
                  disabled={!authenticated}
                  className="w-full px-2 py-1.5 border border-gray-300 text-black text-xs focus:outline-none focus:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <button
              onClick={handleSendTransaction}
              disabled={!authenticated || (isPrivate && !secret)}
              className="w-full px-3 py-2 bg-black text-white font-bold text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {authenticated ? 'send →' : 'connect wallet to send'}
            </button>

            {status && (
              <div className="p-2 border border-gray-300 bg-blue-50">
                <p className="text-xs text-black font-bold">{status}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Recent Transactions */}
        <div className="border border-gray-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">recent transactions</h2>
            <Link 
              href="/explorer" 
              className="px-3 py-1 bg-black text-white text-xs font-bold hover:bg-gray-800"
            >
              explorer →
            </Link>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 border border-gray-300">
                <p className="text-sm text-black font-bold">no transactions yet</p>
                <p className="text-xs text-gray-600 mt-1">send your first one</p>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <Link
                  key={tx.id}
                  href={`/explorer?sig=${tx.signature}`}
                  className="block border border-gray-300 p-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold ${
                        tx.isPrivate ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {tx.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                      </span>
                      {tx.isPrivate && tx.commitment && (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 border border-purple-300">
                          SHIELDED
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-black">
                      {tx.amount} SOL
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-black font-mono mb-1 flex items-center">
                    <span className="font-bold mr-1">sig:</span>
                    <span className="truncate flex-1">{tx.signature.slice(0, 32)}...</span>
                    <CopyButton text={tx.signature} />
                  </div>

                  {!tx.isPrivate && (
                    <div className="space-y-0.5 text-[10px]">
                      <div>
                        <span className="font-bold text-black">from: </span>
                        <code className="font-mono text-black">{tx.sender.slice(0, 12)}...</code>
                      </div>
                      <div>
                        <span className="font-bold text-black">to: </span>
                        <code className="font-mono text-black">{tx.recipient.slice(0, 12)}...</code>
                      </div>
                    </div>
                  )}
                  
                  {tx.isPrivate && tx.commitment && (
                    <div className="text-[10px]">
                      <span className="font-bold text-black">commitment: </span>
                      <code className="font-mono text-black">{tx.commitment.slice(0, 20)}...</code>
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
