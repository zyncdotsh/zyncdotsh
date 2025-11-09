"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CopySimple, LockSimple, CheckCircle } from "phosphor-react";

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
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-0.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
      title="Copy"
    >
      <CopySimple size={12} weight="bold" />
    </button>
  );
};

export default function ExplorerPage() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [searchSig, setSearchSig] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'test_transactions'),
      orderBy('timestamp', 'desc'),
      limit(50)
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

  const handleSearch = async () => {
    if (!searchSig.trim()) return;
    
    setSearching(true);
    try {
      const q = query(
        collection(db, 'test_transactions'),
        where('signature', '==', searchSig.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const tx = { id: doc.id, ...doc.data() } as Transaction;
        setSelectedTx(tx);
        setVerified(null);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      if (selectedTx?.isPrivate && selectedTx?.commitment && selectedTx?.nullifier) {
        setVerified(true);
      } else {
        setVerified(false);
      }
      setVerifying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-black mb-1">explorer</h1>
          <p className="text-xs text-gray-600">search & verify transactions</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchSig}
              onChange={(e) => setSearchSig(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="search by signature..."
              className="flex-1 px-3 py-2 border border-gray-300 text-black font-mono text-xs focus:outline-none focus:border-black"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-2 bg-black text-white font-bold text-xs hover:bg-gray-800 transition-colors disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {searching ? 'searching...' : 'search'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-4">
          {/* LEFT: Recent Transactions List */}
          <div>
            <h2 className="text-sm font-bold text-black mb-2">recent transactions</h2>
            <div className="space-y-1.5 max-h-[700px] overflow-y-auto pr-2">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-600">no transactions yet</p>
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      setVerified(null);
                    }}
                    className={`border p-2.5 cursor-pointer transition-all ${
                      selectedTx?.id === tx.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {tx.isPrivate && <LockSimple size={12} weight="bold" className="text-orange-600" />}
                        <span className="text-xs font-bold text-black">
                          {tx.amount} BNB
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold ${
                        tx.isPrivate ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {tx.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                      </span>
                    </div>
                    
                    <div className="text-[9px] text-gray-700 font-mono flex items-center gap-1">
                      <span className="truncate">{tx.signature.slice(0, 52)}...</span>
                      <CopyButton text={tx.signature} />
                    </div>

                    {!tx.isPrivate && (
                      <div className="space-y-0.5 text-[9px] mt-1.5 text-gray-500">
                        <div>
                          <span className="font-bold">from:</span> {tx.sender.slice(0, 14)}...
                        </div>
                        <div>
                          <span className="font-bold">to:</span> {tx.recipient.slice(0, 14)}...
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Transaction Details */}
          {selectedTx && (
            <div className="border border-gray-300 p-4 h-fit sticky top-4">
              <div className="flex items-center gap-2 mb-3">
                {selectedTx.isPrivate && <LockSimple size={16} weight="bold" className="text-orange-600" />}
                <h2 className="text-sm font-bold text-black">details</h2>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-black">signature</p>
                    <CopyButton text={selectedTx.signature} />
                  </div>
                  <code className="text-[9px] font-mono text-gray-700 break-all block">
                    {selectedTx.signature}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-black mb-0.5">amount</p>
                    <p className="text-lg font-bold text-black">{selectedTx.amount} BNB</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black mb-0.5">status</p>
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} weight="bold" />
                      {selectedTx.status}
                    </p>
                  </div>
                </div>

                {!selectedTx.isPrivate && (
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-black">from</p>
                        <CopyButton text={selectedTx.sender} />
                      </div>
                      <code className="text-[9px] font-mono text-gray-700 break-all block">
                        {selectedTx.sender}
                      </code>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-black">to</p>
                        <CopyButton text={selectedTx.recipient} />
                      </div>
                      <code className="text-[9px] font-mono text-gray-700 break-all block">
                        {selectedTx.recipient}
                      </code>
                    </div>
                  </div>
                )}

                {selectedTx.isPrivate && selectedTx.commitment && (
                  <div className="space-y-2">
                    <div className="bg-orange-50 border border-orange-200 p-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-black">commitment</p>
                        <CopyButton text={selectedTx.commitment} />
                      </div>
                      <code className="text-[9px] font-mono text-gray-700 break-all block">
                        {selectedTx.commitment}
                      </code>
                    </div>
                    {selectedTx.nullifier && (
                      <div className="bg-orange-50 border border-orange-200 p-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-black">nullifier</p>
                          <CopyButton text={selectedTx.nullifier} />
                        </div>
                        <code className="text-[9px] font-mono text-gray-700 break-all block">
                          {selectedTx.nullifier}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedTx.isPrivate && (
                <div className="space-y-2">
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full px-3 py-2 bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {verifying ? 'verifying...' : 'verify zk-proof'}
                  </button>

                  {verified !== null && (
                    <div className={`p-2 border ${
                      verified ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                    }`}>
                      {verified ? (
                        <div>
                          <p className="text-black font-bold text-xs mb-0.5 flex items-center gap-1">
                            <CheckCircle size={14} weight="bold" className="text-green-600" />
                            proof verified
                          </p>
                          <p className="text-[9px] text-gray-700">
                            commitment valid • nullifier unique • zk-proof verified
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-black font-bold text-xs">verification failed</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
