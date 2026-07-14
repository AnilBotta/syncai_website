#!/usr/bin/env node
/**
 * One-time helper to mint a Gmail refresh token for reply detection.
 *
 * Prereqs (Google Cloud Console):
 *   1. Create/pick a project → enable the "Gmail API".
 *   2. Configure the OAuth consent screen (External is fine; add your Gmail as a
 *      Test user so you can consent without app verification).
 *   3. Create an OAuth client of type "Desktop app".
 *   4. Copy the client id + secret.
 *
 * Run it (from the project root), signing in as the inbox that receives replies
 * (EMAIL_REPLY_TO, e.g. syncaitechno@gmail.com):
 *
 *   GMAIL_CLIENT_ID=xxx GMAIL_CLIENT_SECRET=yyy node scripts/gmail-auth.mjs
 *
 * It opens a consent URL, catches the redirect on http://localhost:53682, and
 * prints the GMAIL_REFRESH_TOKEN= line to paste into Vercel + .env.local.
 */
import http from "node:http";
import { URL } from "node:url";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET before running.");
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent"); // force a refresh_token every run

async function exchange(code) {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return res.json();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("No code in callback.");
    return;
  }
  try {
    const token = await exchange(code);
    if (token.refresh_token) {
      res.writeHead(200, { "Content-Type": "text/plain" }).end("Success! You can close this tab and return to the terminal.");
      console.log("\n✅ Add this to Vercel env + .env.local:\n");
      console.log(`GMAIL_REFRESH_TOKEN=${token.refresh_token}\n`);
    } else {
      res.writeHead(200).end("No refresh_token returned — re-run (the consent screen must prompt again).");
      console.error("\n⚠️  No refresh_token in response:", token);
    }
  } catch (err) {
    res.writeHead(500).end("Token exchange failed — see terminal.");
    console.error(err);
  } finally {
    server.close();
    setTimeout(() => process.exit(0), 250);
  }
});

server.listen(PORT, () => {
  console.log("\nOpen this URL in your browser (sign in as the reply inbox):\n");
  console.log(authUrl.toString(), "\n");
  console.log(`Waiting for the Google redirect on ${REDIRECT_URI} ...`);
});
