import request from "supertest";
import app from "../src/app";
import { prisma } from "@lib/prisma";

const nonExistingId: string = "5e53ec19a59a6c0012abca12";
let adminToken: string = "";
let userToken: string = "";
let user3Token: string = "";

beforeAll(async () => {
  const adminLoginResponse = await request(app).post("/auth/login").send({
    email: "admin@example.com",
    password: "adminpassword",
  });
  expect(adminLoginResponse.statusCode).toBe(200);
  adminToken = adminLoginResponse.body.token;

  const userLoginResponse = await request(app).post("/auth/login").send({
    email: "user@example.com",
    password: "password123",
  });
  expect(userLoginResponse.statusCode).toBe(200);
  userToken = userLoginResponse.body.token;

  const user3LoginResponse = await request(app).post("/auth/login").send({
    email: "user3@example.com",
    password: "password123",
  });
  expect(user3LoginResponse.statusCode).toBe(200);
  user3Token = user3LoginResponse.body.token;
});

// POST /setups/save
it("should allow saving a new setup with valid data", async () => {
  const selectedProductIds = await selectOneProductPerCategory();

  const newSetup = {
    name: "New Test Setup",
    products: selectedProductIds,
  };

  const response = await request(app)
    .post("/setups/save")
    .set("Authorization", `Bearer ${userToken}`)
    .send(newSetup);

  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("setupId");
});

it("should not allow saving a setup without a name", async () => {
  const selectedProductIds = await selectOneProductPerCategory();

  const newSetup = {
    name: "",
    products: selectedProductIds,
  };

  const response = await request(app)
    .post("/setups/save")
    .set("Authorization", `Bearer ${userToken}`)
    .send(newSetup);

  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

// DELETE /setups/delete/id
it("should allow delete an existing setup", async () => {
  const setupName = "Setup for admin@example.com";
  const setupId = await findSetupIdByName(setupName);
  const response = await request(app)
    .delete(`/setups/delete/${setupId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(204);
});

it("should return 404 when trying to delete a non-existing setup", async () => {
  const setupId: string = nonExistingId;
  const response = await request(app)
    .delete(`/setups/delete/${setupId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(404);
});

it("should return 400 for delete setup with invalid ID format", async () => {
  const invalidId: string = "99999999999999999999999999";
  const response = await request(app)
    .delete(`/setups/delete/${invalidId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

// GET /setups
it("should retrieve all setups for authenticated user", async () => {
  const response = await request(app)
    .get("/setups")
    .set("Authorization", `Bearer ${userToken}`);
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBeTruthy();
  expect(response.body.length).toBeGreaterThan(0);
});

it("should not allow to retrieve setups without authentication", async () => {
  const response = await request(app).get("/setups");
  expect(response.statusCode).toBe(401);
});

it("should return 404 for user without setups", async () => {
  const response = await request(app)
    .get("/setups")
    .set("Authorization", `Bearer ${user3Token}`);
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty(
    "message",
    "Setups not found for the authenticated user"
  );
});

const findSetupIdByName = async (setupName: string) => {
  const setup = await prisma.setup.findFirst({
    where: {
      name: setupName,
    },
  });

  if (setup) {
    return setup.id;
  } else {
    return null;
  }
};

async function selectOneProductPerCategory() {
  const categories = await prisma.category.findMany({
    take: 6,
    include: {
      products: true,
    },
  });

  const selectedProductIds = categories.map((category) => {
    if (category.products.length > 0) {
      return category.products[0].id;
    } else {
      return;
    }
  });

  return selectedProductIds;
}
