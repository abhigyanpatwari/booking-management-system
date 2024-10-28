import { OAuth2Client } from "oauth2_client";
import { Request, Response } from "npm:express@4.19.2";
import User from "../models/User.ts";
import { create } from "djwt";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const clientId = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const redirectUri = "http://localhost:3000/api/v1/auth/google/callback";

const oauth2Client = new OAuth2Client({
  clientId,
  clientSecret,
  authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  redirectUri,
  defaults: {
    scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
  },
});

export const initiateOAuth = async (_req: Request, res: Response) => {
  const url = await oauth2Client.code.getAuthorizationUri();
  res.redirect(url.toString());
};

export const handleOAuthCallback = async (req: Request, res: Response) => {
  const tokens = await oauth2Client.code.getToken(req.url);
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const userData = await userResponse.json();

  let user = await User.findOne({ email: userData.email });
  if (!user) {
    // Generate a random password using crypto.getRandomValues()
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomPassword = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    user = new User({
      name: userData.name,
      email: userData.email,
      password: randomPassword,
      role: "patient",
    });
    await user.save();
    // TODO: Send an email to the user with instructions to set a new password
  }

  // Generate JWT token
  const token = await createJwtToken(user);

  res.json({ token });
};

async function createJwtToken(user: any) {
  const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your_secret_key";
  const secretKey = await createSecretKey(JWT_SECRET);
  return await create({ alg: "HS256", typ: "JWT" }, { userId: user._id, role: user.role }, secretKey);
}

async function createSecretKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

