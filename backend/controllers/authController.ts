import { Request, Response } from "npm:express@4.19.2";
import { create, verify } from "djwt";
import User from "../models/User.ts";
import { crypto } from "https://deno.land/std@0.210.0/crypto/mod.ts";

// Add interface for JWT payload
interface JWTPayload {
  userId: string;
  role: string;
  isAdmin: boolean;
}

// Add interface for Request with user
interface AuthRequest extends Request {
  user?: JWTPayload;
}

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

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password,
      role: "patient",
      isAdmin: false
    });

    await user.save();

    const token = await createJwtToken(user);
    res.status(201).json({ 
      token,
      isAdmin: user.isAdmin,
      role: user.role 
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    try {
      const isValidPassword = await user.comparePassword(password);
      console.log('Password validation result:', isValidPassword);

      if (!isValidPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const secretKey = await createSecretKey(JWT_SECRET);
      const token = await create(
        { alg: "HS256", typ: "JWT" },
        { 
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin 
        },
        secretKey
      );

      console.log('Login successful for:', email);
      res.json({ 
        token,
        isAdmin: user.isAdmin,
        role: user.role 
      });
    } catch (error) {
      console.error('Password comparison error:', error);
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

export const verifyToken = async (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const secretKey = await createSecretKey(JWT_SECRET);
    const payload = await verify(token, secretKey);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Helper function to create JWT token
async function createJwtToken(user: any) {
  const secretKey = await createSecretKey(JWT_SECRET);
  return await create(
    { alg: "HS256", typ: "JWT" },
    { 
      userId: user._id.toString(),
      role: user.role,
      isAdmin: user.isAdmin 
    },
    secretKey
  );
}

export const checkAdminStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status" });
  }
};
