# Publish Registry Checklist

Never share your private key, mnemonic, keystore, or wallet password. The commands below use your local Sui CLI wallet.

## 1. Confirm Wallet

```bash
sui client active-address
```

Expected:

```txt
0xbbc8f3deb39954974cd4556cd81579429ceb32d7a01d66570ce3d3d542c37b69
```

## 2. Publish to Testnet

```bash
sui client switch --env testnet
sui client publish sui --gas-budget 100000000
```

Record:

```txt
NEXT_PUBLIC_TESTNET_REGISTRY_PACKAGE_ID=
NEXT_PUBLIC_TESTNET_APP_PROFILE_ID=
NEXT_PUBLIC_TESTNET_ADMIN_CAP_ID=
```

## 3. Publish to Mainnet

```bash
sui client switch --env mainnet
sui client publish sui --gas-budget 100000000
```

Record:

```txt
NEXT_PUBLIC_MAINNET_REGISTRY_PACKAGE_ID=
NEXT_PUBLIC_MAINNET_APP_PROFILE_ID=
NEXT_PUBLIC_MAINNET_ADMIN_CAP_ID=
```

## 4. Update App Env

Copy the IDs into `.env.local`, then restart the Next.js dev server.

## 5. Verify

Open the app and check the `Verified Developer` section. It should show Explorer links for the active network.
