import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { SnapFunction } from "@farcaster/snap";
import { registerSnapHandler } from "@farcaster/snap-hono";

const snap: SnapFunction = async (ctx) => {
  const base = process.env.SNAP_PUBLIC_BASE_URL || "http://localhost:3003";
  const url = new URL(ctx.request.url);
  const mode = url.searchParams.get("mode");

  // Handle Sharing flow (Step 2: Return Share action)
  if (ctx.action.type === "post" && mode === "share") {
    const viewerFid = ctx.action.fid;
    return {
      version: "1.0",
      theme: { accent: "green" },
      ui: {
        root: "page",
        elements: {
          page: {
            type: "stack",
            props: {},
            children: ["header", "share_button", "back_button"],
          },
          header: {
            type: "item",
            props: { 
              title: "Ready to Share!", 
              description: "Tap below to cast your own X Profile Snap." 
            },
          },
          share_button: {
            type: "button",
            props: { label: "Cast Now", variant: "primary" },
            on: {
              press: {
                action: "compose_cast",
                params: { 
                  text: "Follow me on X!\n\nsnap by @cashlessman.eth", 
                  embeds: [`${base}/?fid=${viewerFid}`] 
                },
              },
            },
          },
          back_button: {
            type: "button",
            props: { label: "← Back" },
            on: {
              press: {
                action: "submit",
                params: { target: `${base}/` },
              },
            },
          },
        },
      },
    } as any;
  }

  // Default: Show Profile
  const fid = url.searchParams.get("fid") || "268438";
  
  try {
    const apiRes = await fetch(`https://api.farcaster.xyz/v2/user?fid=${fid}`);
    const data = await apiRes.json();
    const user = data.result?.user;

    if (!user) {
      throw new Error("User not found");
    }

    const xAccount = user.connectedAccounts?.find((a: any) => a.platform === "x");
    const xUsername = xAccount?.username;
    
    const elements: Record<string, any> = {
      page: {
        type: "stack",
        props: {},
        children: ["header", "bio", "stats", "actions_row"],
      },
      header: {
        type: "item",
        props: { 
          title: xUsername ? `@${xUsername}` : (user.displayName || `@${user.username}`), 
          description: `@${user.username} (Farcaster)` 
        },
      },
      bio: {
        type: "text",
        props: { 
          text: user.profile?.bio?.text || "No bio set.",
          size: "sm",
          color: "gray"
        },
      },
      stats: {
        type: "text",
        props: { 
          text: `${user.followerCount?.toLocaleString() || 0} followers · ${user.followingCount?.toLocaleString() || 0} following`,
          size: "xs",
          weight: "bold"
        },
      },
      actions_row: {
        type: "stack",
        props: { direction: "horizontal" },
        children: ["share_button", "follow_dev_button"]
      },
      share_button: {
        type: "button",
        props: { label: "Share Yours", variant: "secondary" },
        on: {
          press: {
            action: "submit",
            params: { target: `${base}/?mode=share` },
          },
        },
      },
      follow_dev_button: {
        type: "button",
        props: { label: "Follow dev", variant: "primary" },
        on: {
          press: {
            action: "open_url",
            params: { target: `https://x.com/intent/user?screen_name=kashlessman` },
          },
        },
      }
    };

    if (xUsername) {
      elements["actions_row"].children.unshift("follow_button");
      elements["follow_button"] = {
        type: "button",
        props: { label: "Follow on X", variant: "primary" },
        on: {
          press: {
            action: "open_url",
            params: { target: `https://x.com/intent/user?screen_name=${xUsername}` },
          },
        },
      };
    } else {
      elements["bio"].props.text += "\n\n(No X account linked to this Farcaster profile)";
    }

    return {
      version: "1.0",
      theme: { accent: "blue" },
      ui: {
        root: "page",
        elements
      },
    } as any;
  } catch (err) {
    return {
      version: "1.0",
      theme: { accent: "red" },
      ui: {
        root: "page",
        elements: {
          page: {
            type: "stack",
            props: {},
            children: ["header"],
          },
          header: {
            type: "item",
            props: { 
              title: "Error", 
              description: "Could not load profile. Please try again later." 
            },
          },
        },
      },
    } as any;
  }
};

const __dir = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dir, "../assets/fonts");

const app = new Hono();

registerSnapHandler(app, snap, {
  og: {
    fonts: [
      { path: join(fontsDir, "inter-latin-400-normal.woff"), weight: 400 },
      { path: join(fontsDir, "inter-latin-700-normal.woff"), weight: 700 },
    ],
  },
});

export default app;
