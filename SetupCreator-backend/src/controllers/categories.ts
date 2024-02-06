import { prisma } from "@lib/prisma";
import express from "express";
import { authMiddleware } from "../middlewares/auth";
import { z } from "zod";

const router = express.Router();

/**
 * @openapi
 * /categories:
 *  get:
 *     tags:
 *     - Category
 *     summary: Get all categories and products related with them.
 *     description: Fetches all categories along with their associated products. It's designed to provide a comprehensive list of available categories and items for users.
 *     responses:
 *       200:
 *         description: Successful response, returns categories.
 *       404:
 *         description: Categories not found.
 *
 */
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { products: true },
  });

  if (!categories) {
    return res.status(404).json({ message: "Categories not found" });
  }

  res.status(200).json(categories);
});

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags:
 *     - Category
 *     summary: Get a specific category by its ID and products related to it.
 *     description: Retrieves details of a specific category using its ID, including all products under it. This endpoint is useful for getting information about a single category and its items.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response, returns a category with products.
 *       404:
 *         description: Category not found.
 *       400:
 *         description: Invalid input.
 */
router.get("/:id", async (req, res) => {
  const input = z.object({ id: z.string() }).safeParse(req.params);

  if (!input.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { id } = input.data;
  const category = await prisma.category.findFirst({
    where: { id },
    include: { products: true },
  });

  if (!category || category == null) {
    return res.status(404).json({ message: "Category not found" });
  }

  return res.status(200).json(category);
});

/**
 * @openapi
 * /categories:
 *   post:
 *     tags:
 *     - Category
 *     summary: Add new category.
 *     description: Allows adding a new category. This endpoint is protected, requiring the user to have admin rights. It accepts a category name in the request body and adds it to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Successfully added a category.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required role.
 *       409:
 *         description: Conflict. The category already exists.
 *     security:
 *       - BearerAuth: []
 */
router.post(
  "/",
  authMiddleware({ requiredRole: "ADMIN" }),
  async (req, res) => {
    const input = z.object({ name: z.string() }).safeParse(req.body);

    if (!input.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { name } = input.data;

    const existingCategory = await prisma.category.findFirst({
      where: { name },
    });

    if (existingCategory) {
      return res.status(409).json({ message: "The category already exists" });
    }
    const category = await prisma.category.create({ data: { name } });
    return res.status(201).json(category);
  }
);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     tags:
 *     - Category
 *     summary: Delete a specific category by its ID.
 *     description: Enables deleting a specific category by its ID. It requires admin rights and removes the specified category from the database.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successful deletion of the category.
 *       404:
 *         description: Category not found.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required role.
 *     security:
 *       - BearerAuth: []
 */
router.delete(
  "/:id",
  authMiddleware({ requiredRole: "ADMIN" }),
  async (req, res) => {
    const input = z.object({ id: z.string() }).safeParse(req.params);

    if (!input.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { id } = input.data;
    const category = await prisma.category.findFirst({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const deletedCategory = await prisma.category.delete({ where: { id } });
    return res.status(204).json(deletedCategory);
  }
);

export default router;
