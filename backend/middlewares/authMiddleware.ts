import { Request, Response, NextFunction } from "npm:express@4.19.2";
import { verify } from "djwt";
import { crypto } from "https://deno.land/std@0.210.0/crypto/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your_secret_key";

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

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admin only" });
  }
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const key = await createSecretKey(JWT_SECRET);
    const payload = await verify(token, key);

    req.user = {
      id: payload.userId as string,
      email: payload.email as string,
      isAdmin: payload.isAdmin as boolean
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
