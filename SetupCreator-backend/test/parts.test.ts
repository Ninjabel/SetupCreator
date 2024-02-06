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

it("should retrieve all parts for user", async () => {
  const response = await request(app).get("/parts");
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBeTruthy();
  expect(response.body.length).toBeGreaterThan(0);
});

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

// /update

it("should promote an existing part", async () => {
  const partName = "RTX 3070";
  const partId = await findPartIdByName(partName);
  const response = await request(app)
    .post(`/parts/promote/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("productId");
});

it("should unpromote an existing part that was previously promoted", async () => {
  const partName = "RTX 3080";
  const partId = await findPartIdByName(partName);
  const response = await request(app)
    .post(`/parts/unpromote/${partId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(response.statusCode).toBe(200);
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
