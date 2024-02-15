import request from "supertest";
import app from "../src/app";
import { prisma } from "@lib/prisma";

const nonExistingId: string = "5e53ec19a59a6c0012abca12";
let adminToken: string = "";

beforeAll(async () => {
  const adminLoginResponse = await request(app).post("/auth/login").send({
    email: "admin@example.com",
    password: "adminpassword",
  });
  expect(adminLoginResponse.statusCode).toBe(200);
  adminToken = adminLoginResponse.body.token;
});

// GET /parts/
it("should retrieve all parts for user", async () => {
  const response = await request(app).get("/parts");
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBeTruthy();
  expect(response.body.length).toBeGreaterThan(0);
});

// GET /parts/id
it("should retrieve details of an existing part", async () => {
  const partName = "RTX 3080";
  const partId = await findPartIdByName(partName);
  const response = await request(app).get(`/parts/${partId}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("id");
});

it("should return 404 for a non-existing part", async () => {
  const partId: string = nonExistingId;
  const response = await request(app).get(`/parts/${partId}`);
  expect(response.statusCode).toBe(404);
});

it("should return 400 for get part with invalid ID format", async () => {
  const invalidId: string = "99999999999999999999999999";
  const response = await request(app).get(`/parts/${invalidId}`);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

// POST /parts/
it("should allow creating a new part with valid data", async () => {
  const newPart = {
    name: "New Test Part Processor",
    ceneoId: "999999",
    categoryId: "65c15739239649a362f7b810",
  };
  const response = await request(app)
    .post("/parts")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(newPart);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("id");
});

it("should not allow creating a part without a name", async () => {
  const newPart = { description: "New Part Description", price: 100 };
  const response = await request(app)
    .post("/parts")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(newPart);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

// DELETE /parts/id
it("should allow deleting an existing part", async () => {
  const partName = "650W";
  const partId = await findPartIdByName(partName);
  const response = await request(app)
    .delete(`/parts/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(204);
});

it("should return 404 when trying to delete a non-existing part", async () => {
  const partId: string = nonExistingId;
  const response = await request(app)
    .delete(`/parts/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty("message", "Product not found");
});

it("should return 400 for get part with invalid ID format", async () => {
  const invalidId: string = "99999999999999999999999999";
  const response = await request(app)
    .delete(`/parts/${invalidId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

// POST /parts/update
it("should return update all products", async () => {
  const response = await request(app)
    .post("/parts/update")
    .set("Authorization", `Bearer ${adminToken}`);

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({
    success: true,
    message: "Products details successfully updated",
  });
}, 10000);
// POST /parts/promote/id
it("should promote an existing part", async () => {
  const partName = "RTX 3070";
  const partId = await findPartIdByName(partName);
  const response = await request(app)
    .post(`/parts/promote/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("productId");
});

it("should return 404 when trying to promote a non-existing part", async () => {
  const partId: string = nonExistingId;
  const response = await request(app)
    .post(`/parts/promote/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty("message", "Product not found");
});

it("should return 400 for promote part with invalid ID format", async () => {
  const invalidId: string = "99999999999999999999999999";
  const response = await request(app)
    .post(`/parts/promote/${invalidId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

// POST /parts/unpromote/id
it("should unpromote an existing part that was previously promoted", async () => {
  const partName = "RTX 3080";
  const partId = await findPartIdByName(partName);
  const response = await request(app)
    .post(`/parts/unpromote/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(200);
});

it("should return 404 when trying to unpromote a non-existing part", async () => {
  const partId: string = nonExistingId;
  const response = await request(app)
    .post(`/parts/unpromote/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty("message", "Product not found");
});

it("should return 400 for unpromote part with invalid ID format", async () => {
  const invalidId: string = "99999999999999999999999999";
  const response = await request(app)
    .post(`/parts/unpromote/${invalidId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

const findPartIdByName = async (partName: string) => {
  const part = await prisma.product.findFirst({
    where: {
      name: partName,
    },
  });

  if (part) {
    return part.id;
  } else {
    return null;
  }
};
