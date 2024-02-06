import request from "supertest";
import app from "../src/app";
import { prisma } from "@lib/prisma";

let adminToken: string = "";
const nonExistingId: string = "5e53ec19a59a6c0012abca12";

beforeAll(async () => {
  const adminLoginResponse = await request(app).post("/auth/login").send({
    email: "admin@example.com",
    password: "adminpassword",
  });
  expect(adminLoginResponse.statusCode).toBe(200);
  adminToken = adminLoginResponse.body.token;
});

it("should retrieve all categories for user", async () => {
  const response = await request(app).get("/categories");
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBeTruthy();
  expect(response.body.length).toBeGreaterThan(0);
});

it("should retrieve details of an existing category", async () => {
  const categoryName = "Procesory";
  const categoryId = await findCategoryIdByName(categoryName);
  const response = await request(app).get(`/categories/${categoryId}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("id", categoryId);
});

it("should return 404 for a non-existing category", async () => {
  const categoryId: string = nonExistingId;
  const response = await request(app).get(`/categories/${categoryId}`);
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty("message", "Category not found");
});

it("should allow creating a new category with valid data", async () => {
  const newCategory = { name: "New Test Category" };
  const response = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(newCategory);

  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("id");
});

it("should not allow creating a category without a name", async () => {
  const newCategory = {};
  const response = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(newCategory);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

it("should allow deleting an existing category", async () => {
  const categoryName = "Obudowy";
  const categoryId = await findCategoryIdByName(categoryName);
  const response = await request(app)
    .delete(`/categories/${categoryId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(204);
});

it("should return 404 when trying to delete a non-existing category", async () => {
  const categoryId: string = nonExistingId;
  const response = await request(app)
    .delete(`/categories/${categoryId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty("message", "Category not found");
});

const findCategoryIdByName = async (categoryName: string) => {
  const category = await prisma.category.findFirst({
    where: {
      name: categoryName,
    },
  });

  if (category) {
    return category.id;
  } else {
    return null;
  }
};
