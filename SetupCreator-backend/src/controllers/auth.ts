import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import z from "zod";
import { prisma } from "@lib/prisma";

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *     - Auth
 *     summary: Register a new user.
 *     description: This endpoint allows new users to sign up by providing an email and password. It encrypts the password for security before saving the user's information in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully registered.
 *       400:
 *         description: Invalid input.
 *       409:
 *         description: User already exists.
 */
router.post("/register", async (req, res) => {
  const input = z
    .object({
      email: z.string().email(),
      password: z.string(),
    })
    .safeParse(req.body);

  if (!input.success) {
    return res.status(400).json(input.error);
  }

  const { email, password } = input.data;
  const existingUser = await prisma.user.findFirst({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return res.status(200).json({ message: "User successfully registered" });
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *     - Auth
 *     summary: Authenticate a user and return JWT token.
 *     description: Endpoint verifies the user's credentials and, if successful, issues a JWT for immediate use and a refresh token to ensure session continuity. This approach secures user sessions and simplifies access to the application. It also deletes expired refresh tokens from database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully authenticated and JWT token returned.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/login", async (req, res) => {
  const input = z
    .object({
      email: z.string().email(),
      password: z.string(),
    })
    .safeParse(req.body);

  if (!input.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { email, password } = input.data;
  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.AUTH_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.REFRESH_SECRET!
  );

  const now = new Date();
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return res.status(200).json({ token, refreshToken });
});

/**
 * @openapi
 * /auth/token:
 *   post:
 *     tags:
 *     - Auth
 *     summary: Generate new access token.
 *     description: This endpoint is designed to refresh an access token using a refresh token. When a user provides a valid refresh token, the server checks if it's still valid and not expired. If everything checks out, it generates a new access token for the user, allowing them to continue accessing the system without needing to log in again.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Successfully generated new access token.
 *       400:
 *         description: Invalid input.
 *       403:
 *         description: Refresh token is invalid or has expired.
 *       404:
 *         description: User not found.
 */
router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh Token is required" });
  }

  const token = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!token || token.expiresAt < new Date()) {
    return res
      .status(403)
      .json({ message: "Refresh token is invalid or has expired" });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.REFRESH_SECRET!,
    { expiresIn: "15m" }
  );

  return res.status(200).json({ accessToken, refreshToken: token.token });
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *     - Auth
 *     summary: Log out user.
 *     description: Allows users to log out by invalidating their refresh token. When a user submits their refresh token, the server deletes it from the database, ensuring the user must log in again to receive a new access token and refresh token pair. This helps maintain security by preventing old tokens from being used for access.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       204:
 *         description: User successfully log out.
 *       400:
 *         description: Invalid input.
 */
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh Token is required" });
  }

  const token = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!token) {
    return res.status(204).send();
  }

  await prisma.refreshToken.delete({
    where: { id: token.id },
  });

  return res.status(204).send();
});

export default router;
