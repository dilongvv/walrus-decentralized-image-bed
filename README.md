# Walrus Decentralized Image Bed

去中心化图床 / 文件分享工具，基于 Next.js 14 App Router、TypeScript、Tailwind CSS、Shadcn/ui 风格组件、Sui dApp Kit 和官方 `@mysten/walrus` TypeScript SDK。

## Project Structure

```txt
.
├── app
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── providers.tsx
│   ├── ui
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   └── skeleton.tsx
│   └── walrus
│       ├── header.tsx
│       ├── history-list.tsx
│       ├── network-switcher.tsx
│       ├── status-message.tsx
│       ├── upload-dropzone.tsx
│       ├── upload-result.tsx
│       ├── verified-developer.tsx
│       └── walrus-image-bed.tsx
├── lib
│   ├── constants.ts
│   ├── history.ts
│   ├── identity.ts
│   ├── types.ts
│   ├── utils.ts
│   └── walrus.ts
├── public
├── scripts
│   └── publish-registry.md
├── sui
│   ├── Move.toml
│   ├── README.md
│   └── sources
│       └── app_registry.move
├── .env.example
├── .gitignore
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Features

- Sui wallet connection via `@mysten/dapp-kit` `ConnectButton`.
- Testnet / Mainnet network switcher.
- Drag-and-drop and click-to-select upload area.
- File validation for images, PDF, video, text, JSON, ZIP, max 100MB.
- Browser-friendly Walrus Upload Relay flow using `writeFilesFlow`.
- Wallet-signed register and certify transactions.
- Upload progress states, friendly errors, loading skeletons, and success confetti.
- Blob ID, `wal.app` share link, aggregator link, and concise storage proof display.
- Image preview after upload.
- Copy link / ID actions.
- Local upload history: latest 20 records in `localStorage`.
- On-chain developer identity Registry package for Explorer verification.
- Vercel-friendly Next.js setup.

## Official References Used

- Walrus TypeScript SDK docs: https://sdk.mystenlabs.com/walrus
- Walrus Upload Relay docs: https://docs.wal.app/docs/operator-guide/upload-relay
- Sui dApp Kit provider docs: https://sdk.mystenlabs.com/dapp-kit/sui-client-provider
- Relay example app requested by the spec: https://github.com/MystenLabs/walrus-sdk-relay-example-app
- Walrus onboarding examples requested by the spec: https://github.com/MystenLabs/walrus

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment

```bash
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_WALRUS_EPOCHS=3
NEXT_PUBLIC_TESTNET_FULLNODE=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_MAINNET_FULLNODE=https://fullnode.mainnet.sui.io:443
NEXT_PUBLIC_TESTNET_UPLOAD_RELAY=https://upload-relay.testnet.walrus.space
NEXT_PUBLIC_MAINNET_UPLOAD_RELAY=https://upload-relay.mainnet.walrus.space
NEXT_PUBLIC_TESTNET_AGGREGATOR=https://aggregator.testnet.walrus.space
NEXT_PUBLIC_MAINNET_AGGREGATOR=https://aggregator.mainnet.walrus.space
NEXT_PUBLIC_DEVELOPER_WALLET=0xbbc8f3deb39954974cd4556cd81579429ceb32d7a01d66570ce3d3d542c37b69
NEXT_PUBLIC_PROJECT_WEBSITE=https://github.com/dilongvv/walrus-decentralized-image-bed
NEXT_PUBLIC_PROJECT_GITHUB=https://github.com/dilongvv/walrus-decentralized-image-bed
NEXT_PUBLIC_DEVELOPER_SUINS=TBD
NEXT_PUBLIC_SUI_EXPLORER_BASE=https://suiexplorer.com
NEXT_PUBLIC_TESTNET_REGISTRY_PACKAGE_ID=0xc972d197b10609c95c77519244f0290e3b057e4c9dcbfcfb1ef75eadf3e1d82c
NEXT_PUBLIC_TESTNET_APP_PROFILE_ID=0x07e047f13d39cc83ef9bd6c06ab03fc039ecb244dc07aae06038f85ff4ea9914
NEXT_PUBLIC_TESTNET_ADMIN_CAP_ID=0x7c41382f85b8a5c73f1ece2575481ff66b04972733c4f78b373358b425c772ff
NEXT_PUBLIC_MAINNET_REGISTRY_PACKAGE_ID=0x01595e8774c136091eb12b6b12c0a363a62a53f3fcc028c34a25fffe7dcdb85d
NEXT_PUBLIC_MAINNET_APP_PROFILE_ID=0x9091fbc8163b16662883d5ef1daac136eca48d0aa00a6865dc6fa1eb7465bced
NEXT_PUBLIC_MAINNET_ADMIN_CAP_ID=0x5da346646c428e37e6c3fb5eaecc5318c04992516dc54e26b8ea6f02d34606ab
```

## On-chain Developer Identity

The `sui/` package creates a lightweight Registry identity for this app. It does not handle Walrus uploads and does not add gas to normal user uploads. Its only job is to make the developer wallet discoverable and verifiable on Sui.

Developer wallet:

```txt
0xbbc8f3deb39954974cd4556cd81579429ceb32d7a01d66570ce3d3d542c37b69
```

Published objects:

```txt
AdminCap: owned by the developer wallet
AppProfile: shared object with app metadata
AppRegistered: event emitted during publish
UpgradeCap: initially held by the developer wallet
```

Testnet registry:

```txt
Transaction Digest: 6A7SgcHPbvuqSeT6DVJFoem97WKV9rZFwwMjcLi4GKzT
Package ID: 0xc972d197b10609c95c77519244f0290e3b057e4c9dcbfcfb1ef75eadf3e1d82c
AppProfile Object ID: 0x07e047f13d39cc83ef9bd6c06ab03fc039ecb244dc07aae06038f85ff4ea9914
AdminCap Object ID: 0x7c41382f85b8a5c73f1ece2575481ff66b04972733c4f78b373358b425c772ff
UpgradeCap Object ID: 0xfa5a5ea7d4e8c2c2700c950a98554c2d782e49a6f3d8b21628875bf8a08b8ba8
```

Mainnet registry:

```txt
Transaction Digest: 9fzLADEtiCfAaaj9hBPE23wuyeSJek4otNawSzXkxaJi
Package ID: 0x01595e8774c136091eb12b6b12c0a363a62a53f3fcc028c34a25fffe7dcdb85d
AppProfile Object ID: 0x9091fbc8163b16662883d5ef1daac136eca48d0aa00a6865dc6fa1eb7465bced
AdminCap Object ID: 0x5da346646c428e37e6c3fb5eaecc5318c04992516dc54e26b8ea6f02d34606ab
UpgradeCap Object ID: 0xef2c4672deb1c7a91be28a72d97b08d053308d809edebc9ff031f40b17c281cc
```

Publish checklist:

```bash
sui client active-address
sui client switch --env testnet
sui client publish sui --gas-budget 100000000
```

Repeat on Mainnet after confirming the Testnet result. The package relies on Sui CLI automatic framework dependencies, so the same source can be used for both networks.

After each publish, copy the public package/object IDs into `.env.local`. The app's `Verified Developer` section will then show clickable Explorer links for the active network.

Explorer verification path:

```txt
1. Open the Registry package in Sui Explorer.
2. Confirm the publish transaction sender is the developer wallet.
3. Open the AppProfile object.
4. Confirm app_name, developer, website_url, github_url, SuiNS, and version.
5. Confirm UpgradeCap is held by the developer wallet or a disclosed multisig.
```

Detailed commands are in `scripts/publish-registry.md` and `sui/README.md`.

## Build

```bash
npm run typecheck
npm run build
```

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy with the default Next.js settings.

## Notes

The upload implementation lives in `lib/walrus.ts`. It uses `SuiGrpcClient` plus the Walrus extension and configures `uploadRelay.host` per selected network. The UI calls `writeFilesFlow`, then executes:

1. `encode`
2. `register` with the connected wallet address
3. wallet `signAndExecuteTransaction`
4. `upload` through the selected relay
5. `certify` with a second wallet signature
6. `listFiles` to obtain the final Walrus file metadata

The connected wallet must have enough SUI for gas and the network's required Walrus storage costs.
