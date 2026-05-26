# Walrus Image Bed Registry

This Move package creates the on-chain developer identity for the Walrus Decentralized Image Bed app.

It publishes:

- `AdminCap`: owned by the publishing developer wallet.
- `AppProfile`: shared object containing app name, developer wallet, website, GitHub, SuiNS, and version.
- `AppRegistered`: event emitted at publish time.
- `AppProfileUpdated`: event emitted when the profile is updated.

## Developer Wallet

```txt
0xbbc8f3deb39954974cd4556cd81579429ceb32d7a01d66570ce3d3d542c37b69
```

The module initializer checks that the publishing wallet matches this address. Publishing from another wallet aborts.

## Publish

Testnet:

```bash
sui client switch --env testnet
sui client active-address
sui client publish sui --gas-budget 100000000
```

Mainnet:

```bash
sui client switch --env mainnet
sui client active-address
sui client publish sui --gas-budget 100000000
```

After publishing, copy these public IDs from the transaction output:

```txt
Package ID
AppProfile Object ID
AdminCap Object ID
UpgradeCap Object ID
Publish transaction digest
```

Add them to `.env.local` and to the public README verification section.

## Update Profile

`website`, `github`, and `SuiNS` are currently initialized as `TBD`. After deployment or SuiNS registration, update the profile by calling:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module app_registry \
  --function update_profile \
  --args <ADMIN_CAP_ID> <APP_PROFILE_ID> "https://your-site.example" "https://github.com/you/repo" "@your-suins" "1.0.0" "$(date +%s000)" \
  --gas-budget 50000000
```

Run the call on both Testnet and Mainnet if both profiles should stay aligned.

## Explorer Verification

Anyone can verify the developer identity by opening the `AppProfile` object in Sui Explorer and checking:

- `developer` equals the public developer wallet.
- `app_name` equals `Walrus Decentralized Image Bed`.
- `website_url`, `github_url`, and `suins_name` match the public project surfaces.
- The publish transaction sender is the developer wallet.
- The `UpgradeCap` is held by the developer wallet or a disclosed multisig.
