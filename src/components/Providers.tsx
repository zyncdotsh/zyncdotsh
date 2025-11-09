"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmfnl9d7t000nl80b7q7tatil"
      config={{
        appearance: {
          walletChainType: 'solana-only',
          walletList: ['phantom']
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors({
              shouldAutoConnect: true,
            }),
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
