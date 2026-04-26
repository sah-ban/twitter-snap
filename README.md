# X Profile Snap

A [Farcaster Snap](https://docs.farcaster.xyz/snap) that displays your linked **X (Twitter) profile** directly inside a Farcaster cast. Viewers can follow you on X, share their own profile snap, or follow the developer — all without leaving their feed.

## Features

- 🐦 **X Profile display** — shows your X username
- 🔗 **Follow on X** button — deeplinks directly to your X profile (only shown if you have an X account linked on Farcaster)
- 📢 **Share Yours** — lets any viewer cast their own version of this snap
- 👤 **Follow dev** button — links to the developer's X account

## How It Works

When someone opens the snap, it:
1. Reads the `fid` (Farcaster ID) from the URL query param
2. Fetches the user's profile from the Farcaster API
3. Checks for a linked X account via `connectedAccounts`
4. Renders a Snap UI with profile info and action buttons

## Tech Stack

| | |
|---|---|
| Runtime | [Hono](https://hono.dev/) on Node.js |
| Snap SDK | `@farcaster/snap` + `@farcaster/snap-hono` |
| Language | TypeScript |
| Package manager | pnpm |
| Hosting | [Neynar Host](https://host.neynar.app) |

## Local Development

```bash
pnpm install
pnpm dev
```

The server starts at `http://localhost:3003`.

## Deployment

Deployment is handled via Neynar's hosting API. Package the project first:

```bash
bash package-for-host-neynar.sh
```

Then deploy using the `deploy.ps1` script (kept out of version control — contains API key):

```powershell
# deploy.ps1
curl.exe -X POST https://api.host.neynar.app/v1/deploy `
  -H "Authorization: Bearer <YOUR_API_KEY>" `
  -F "files=@google-snap.tar.gz" `
  -F "projectName=google-snap-sahban" `
  -F "framework=hono" `
  -F 'env={"SNAP_PUBLIC_BASE_URL":"https://google-snap-sahban.host.neynar.app"}'
```

## Environment Variables

| Variable | Description |
|---|---|
| `SNAP_PUBLIC_BASE_URL` | Public URL of the deployed snap (used to build action targets) |

## Live URL

`https://google-snap-sahban.host.neynar.app`

---

Built by [@cashlessman.eth](https://x.com/kashlessman)
