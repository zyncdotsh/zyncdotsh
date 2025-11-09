# Privacy Protocol - Phase 1

A privacy-first shielded pool protocol using zero-knowledge proofs. Inspired by Tornado Cash and Zcash, built for the modern crypto ecosystem.

## Vision

"privacy is not a feature, it's a fundamental right" - A privacy protocol that lets you deposit assets into a shielded pool and withdraw them anonymously. No one knows which assets you own or when you moved them.

## Architecture Overview

### Phase 1: Shielded Pool (Current)

This initial phase implements a functional shielded pool on EVM chains (Base/BNB/Ethereum) with:

1. **zk-SNARK Circuits** - Zero-knowledge proofs for private transactions
2. **Smart Contract Vault** - Secure on-chain storage with merkle tree
3. **Web Interface** - User-friendly demo for testing the flow
4. **Explorer** - View commitments and nullifiers (not balances)

### Core Components

```
circuits/
├── deposit.circom    - Proves you know secret+nullifier → commitment
└── withdraw.circom   - Proves you know secret for a merkle tree leaf

contracts/
└── Vault.sol         - Shielded pool contract with merkle tree

src/
├── components/
│   ├── Navbar.tsx         - Navigation
│   ├── Footer.tsx         - Footer with social links
│   └── PrivacyDemo.tsx    - Interactive demo UI
└── app/
    ├── page.tsx           - Homepage with ecosystem tools
    ├── emblem/page.tsx    - Privacy protocol demo
    └── explorer/page.tsx  - Transaction explorer
```

## How It Works

### 1. Deposit Flow

```
User generates:
  secret = random 256-bit number
  nullifier = random 256-bit number
  commitment = Poseidon(secret, nullifier)

Smart contract:
  1. Store commitment in merkle tree
  2. Transfer assets to vault
  3. Emit Deposit event (commitment only)

Result: Assets are now in shielded pool, linked to commitment
```

### 2. Withdraw Flow

```
User generates zk-SNARK proof:
  Private inputs: secret, nullifier, merkle path
  Public inputs: merkle root, nullifierHash, recipient

Proof proves:
  - I know a secret+nullifier that hashes to a commitment
  - That commitment exists in the merkle tree (via path)
  - Without revealing which commitment it is

Smart contract:
  1. Verify zk-SNARK proof
  2. Check nullifier hasn't been used (prevent double-spend)
  3. Transfer assets to recipient
  4. Mark nullifier as spent

Result: Assets withdrawn, no one knows which deposit it came from
```

## Getting Started

### Prerequisites

```bash
# Node.js and npm
node --version  # v18+
npm --version   # v9+

# For circuit compilation
npm install -g circom
npm install -g snarkjs
```

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Features

The current demo lets you:

1. **Generate Commitment** - Create a commitment from secret+nullifier
2. **Simulate Deposit** - See how asset deposit would work
3. **Generate Proof** - Simulate zk-SNARK proof generation
4. **Simulate Withdrawal** - Test anonymous withdrawal flow

All functions are currently simulated - next steps will integrate real crypto.

## Roadmap

### Phase 1: MVP (2-4 weeks) - In Progress
- [x] zk circuits (deposit.circom, withdraw.circom)
- [x] Vault.sol smart contract skeleton
- [x] Web UI demo
- [x] Firebase integration for transaction logging
- [x] Wallet integration (Privy)
- [ ] Integrate circomlib for Poseidon hashing
- [ ] Compile circuits to generate proving keys
- [ ] Deploy to testnet (Base Sepolia or BNB Testnet)
- [ ] Actual proof generation in browser

### Phase 2: Production (4-8 weeks)
- [ ] Optimized merkle tree (incremental updates)
- [ ] Relayer service for anonymous withdrawals
- [ ] Enhanced explorer showing commitments/nullifiers
- [ ] Gas fee abstraction
- [ ] Multi-chain support
- [ ] Audit and security review

### Phase 3: Ecosystem (8-12 weeks)
- [ ] Private swaps
- [ ] Shielded lending
- [ ] Cross-chain bridges
- [ ] Mobile app
- [ ] Decentralized relayer network

## Technical Details

### Circuits

**deposit.circom**
- Inputs: secret, nullifier (private)
- Output: commitment = Poseidon(secret, nullifier)
- Purpose: Generate commitment for deposit

**withdraw.circom**
- Private inputs: secret, nullifier, merkle path
- Public inputs: root, nullifierHash, recipient
- Purpose: Prove ownership without revealing which asset
- Merkle depth: 20 levels (1M max deposits)

### Smart Contract

**Vault.sol**
- Stores commitments in merkle tree
- Verifies zk-SNARK proofs on withdrawal
- Prevents double-spending via nullifier tracking
- Events: Deposit (commitment, leafIndex), Withdrawal (recipient, nullifierHash)

### Security Features

1. **Zero-Knowledge** - Proofs reveal nothing about secret/nullifier
2. **Nullifier Prevention** - Each deposit can only be withdrawn once
3. **Merkle Tree** - Efficient proof of membership
4. **Non-custodial** - Users always control their secrets
5. **Trustless** - Math guarantees, not reputation

## Learn More

### Key Concepts

**Commitment**: Hash of secret+nullifier, posted publicly  
**Nullifier**: Unique ID to prevent double-spending  
**zk-SNARK**: Zero-Knowledge Succinct Non-Interactive Argument of Knowledge  
**Merkle Tree**: Efficient way to prove a value is in a set  
**Poseidon**: zk-friendly hash function  

### Resources

- [Tornado Cash Architecture](https://docs.tornado.cash/)
- [Circom Documentation](https://docs.circom.io/)
- [snarkjs Guide](https://github.com/iden3/snarkjs)
- [zk-SNARKS Explained](https://z.cash/technology/zksnarks/)

## Contributing

This is an experimental privacy protocol. Contributions welcome!

## Disclaimer

This is experimental software. Do not use with real assets until audited. The developers are not responsible for any loss of funds.

## License

MIT

---

An experiment by [Simba Masters](https://www.linkedin.com/in/simba-masters-b03a20232/)
