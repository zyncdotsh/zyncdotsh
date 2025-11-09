"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmfnl9d7t000nl80b7q7tatil"
      config={{
        appearance: {
          walletList: ['metamask', 'coinbase_wallet', 'wallet_connect', 'phantom'],
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors({
              shouldAutoConnect: true,
            }),
          },
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}
