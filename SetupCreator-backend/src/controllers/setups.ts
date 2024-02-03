import { prisma } from "@lib/prisma";
import express, { Request, Response } from "express";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

/**
 * @openapi
 * /setups/save:
 *   post:
 *     tags:
 *     - Setup
 *     summary: Save a new setup.
 *     description: Allows authenticated users to save new setups, which are personalized configurations of products. It expects a setup name and a list of product IDs in the request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Setup successfully saved.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *     security:
 *       - BearerAuth: []
 */
router.post("/save", authMiddleware(), async (req: Request, res: Response) => {
  const input = z
    .object({
      name: z.string(),
      products: z.array(z.string()),
    })
    .safeParse(req.body);

  if (!input.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { name, products } = input.data;
  const setup = await prisma.setup.create({
    data: {
      name,
      userId: req.app.locals.userId,
      products: { connect: products.map((id) => ({ id })) },
    },
  });

  return res.status(200).json({ setupId: setup.id });
});

/**
 * @openapi
 * /setups/delete/{id}:
 *   delete:
 *     tags:
 *     - Setup
 *     summary: Delete a specific setup by its ID.
 *     description: Designed for users to delete their setups by specifying the setup ID. It ensures that only the owner can delete their setup.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setup successfully deleted.
 *       404:
 *         description: Setup not found.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *     security:
 *       - BearerAuth: []
 */
router.delete(
  "/delete/:id",
  authMiddleware(),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const setup = await prisma.setup.findFirst({
      where: { id, userId: req.app.locals.userId },
    });

    if (!setup) {
      return res.status(404).json({ message: "Setup not found" });
    }

    const deletedSetup = await prisma.setup.delete({ where: { id } });
    return res.status(200).json({ setupId: deletedSetup.id });
  }
);

/**
 * @openapi
 * /setups:
 *   get:
 *     tags:
 *     - Setup
 *     summary: Retrieve all setups for the authenticated user.
 *     description: Retrieves all setups saved by the authenticated user, showing the user's personalized configurations. It's destinated to provide users with easy access to their saved setups.
 *     responses:
 *       200:
 *         description: Returns an array of setups.
 *       404:
 *         description: Setups not found for the authenticated user.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *     security:
 *       - BearerAuth: []
 */
router.get("/", authMiddleware(), async (req: Request, res: Response) => {
  const setups = await prisma.setup.findMany({
    where: { userId: req.app.locals.userId },
    include: { products: true },
  });

  if (setups.length === 0) {
    return res
      .status(404)
      .json({ message: "Setups not found for the authenticated user" });
  }

  return res.status(200).json(setups);
});

export default router;
