import { prisma } from "@lib/prisma";
import express from "express";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth";
import { scrapProductDetails } from "../utils/cheerio";

const router = express.Router();

/**
 * @openapi
 * /parts:
 *   get:
 *     tags:
 *     - Part
 *     summary: Retrieve all products.
 *     description: Retrieves all products, including their categories.
 *     responses:
 *       200:
 *         description: Returns an array of products.
 *       404:
 *         description: No products found.
 */
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { products: true },
  });

  if (categories.length === 0) {
    return res.status(404).send({ message: "No products found" });
  }

  return res.status(200).json(categories);
});

/**
 * @openapi
 * /parts/{id}:
 *   get:
 *     tags:
 *     - Part
 *     summary: Get a specific product by its ID.
 *     description: Fetches a specific product by its ID, offering detailed information about that product.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response, returns a product.
 *       404:
 *         description: Product not found.
 *       400:
 *         description: Invalid input.
 */
router.get("/:id", async (req, res) => {
  const input = z.object({ id: z.string() }).safeParse(req.params);

  if (!input.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { id } = input.data;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
});

/**
 * @openapi
 * /part:
 *   post:
 *     tags:
 *     - Part
 *     summary: Create a new product.
 *     description: Enables creating new products by accepting product details in a JSON payload. This endpoint is key for adding new items to the product catalog. Requires admin rights.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               ceneoId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product successfully created.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required role.
 *     security:
 *       - BearerAuth: []
 */
router.post(
  "/",
  authMiddleware({ requiredRole: "ADMIN" }),
  async (req, res) => {
    const input = z
      .object({
        name: z.string(),
        ceneoId: z.string(),
        categoryId: z.string(),
      })
      .safeParse(req.body);

    if (!input.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { name, categoryId, ceneoId } = input.data;

    const { price, image, summaryShopImage, summaryShopUrl } =
      await scrapProductDetails(ceneoId);
    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        ceneoId,
        price,
        photoUrl: image,
        shopImage: summaryShopImage,
        shopUrl: summaryShopUrl,
      },
    });

    return res.status(201).json(product);
  }
);

/**
 * @openapi
 * /parts/{id}:
 *   delete:
 *     tags:
 *     - Part
 *     summary: Delete a specific product by its ID.
 *     description: Allows admin users to delete a specific product by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully deleted.
 *       404:
 *         description: Product not found.
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
    const product = await prisma.product.findFirst({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ productId: product.id });
  }
);

/**
 * @openapi
 * /parts/update:
 *   post:
 *     tags:
 *     - Part
 *     summary: Update all products.
 *     description: Enables admin users to update all products. Refreshes product details, such as prices and images, by fetching updated information from external sources.
 *     responses:
 *       200:
 *         description: Products successfully updated.
 *       500:
 *         description: Internal server error, products details update failed.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required role.
 *     security:
 *       - BearerAuth: []
 */
router.post(
  "/update",
  authMiddleware({ requiredRole: "ADMIN" }),
  async (req, res) => {
    try {
      const products = await prisma.product.findMany();
      const promises = products
        .filter((product) => !!product.ceneoId)
        .map(async (product) => {
          const { price, image, summaryShopImage, summaryShopUrl } =
            await scrapProductDetails(product.ceneoId as string);
          await prisma.product.update({
            where: { id: product.id },
            data: {
              price,
              photoUrl: image,
              shopImage: summaryShopImage,
              shopUrl: summaryShopUrl,
            },
          });
        });

      await Promise.all(promises);

      return res.status(200).json({
        success: true,
        message: "Products details successfully updated",
      });
    } catch (error) {
      console.error("Products details update error: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Products details update failed" });
    }
  }
);

/**
 * @openapi
 * /parts/promote/{id}:
 *   post:
 *     tags:
 *     - Part
 *     summary: Promote a specific product by its ID.
 *     description: Allows admin users to highlight a specific product by marking it as promoted. This action can help increase the visibility of selected products to users.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully promoted.
 *       404:
 *         description: Product not found.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required role.
 *     security:
 *       - BearerAuth: []
 */
router.post(
  "/promote/:id",
  authMiddleware({ requiredRole: "ADMIN" }),
  async (req, res) => {
    const input = z.object({ id: z.string() }).safeParse(req.params);

    if (!input.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { id } = input.data;
    const product = await prisma.product.findFirst({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.update({ where: { id }, data: { isPromoted: true } });
    return res.status(200).json({ productId: product.id });
  }
);

/**
 * @openapi
 * /parts/unpromote/{id}:
 *   post:
 *     tags:
 *     - Part
 *     summary: Unpromote a specific product by its ID.
 *     description: Enables admin users to remove the promoted status from a specific product.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully unpromoted.
 *       404:
 *         description: Product not found.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required role.
 *     security:
 *       - BearerAuth: []
 */
router.post(
  "/unpromote/:id",
  authMiddleware({ requiredRole: "ADMIN" }),
  async (req, res) => {
    const input = z.object({ id: z.string() }).safeParse(req.params);

    if (!input.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { id } = input.data;
    const product = await prisma.product.findFirst({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.update({ where: { id }, data: { isPromoted: false } });
    return res.status(200).json({ productId: product.id });
  }
);

export default router;
