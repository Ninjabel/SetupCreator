import request, { Response } from "supertest";
import app from "../src/app";
import { prisma } from "@lib/prisma";

let userToken: string = "";

beforeAll(async () => {
  const userLoginResponse: Response = await request(app)
    .post("/auth/login")
    .send({
      email: "user@example.com",
      password: "password123",
    });
  expect(userLoginResponse.statusCode).toBe(200);
  userToken = userLoginResponse.body.token;
});

it("should successfully register a new user with valid email and password", async (): Promise<void> => {
  const userData: { email: string; password: string } = {
    email: "test@example.com",
    password: "Password123!",
  };
  const response: Response = await request(app)
    .post("/auth/register")
    .send(userData);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty(
    "message",
    "User successfully registered"
  );
});

it("should not allow registration with an email that already exists", async (): Promise<void> => {
  const userData: { email: string; password: string } = {
    email: "user@example.com",
    password: "Password123!",
  };
  const response: Response = await request(app)
    .post("/auth/register")
    .send(userData);
  expect(response.statusCode).toBe(409);
  expect(response.body).toHaveProperty("message", "User already exists");
});

it("should not allow registration without an email", async () => {
  const userData = { password: "Password123!" };
  const response = await request(app).post("/auth/register").send(userData);
  expect(response.statusCode).toBe(400);
});

it("should not allow registration without a password", async () => {
  const userData = { email: "test@example.com" };
  const response = await request(app).post("/auth/register").send(userData);
  expect(response.statusCode).toBe(400);
});

it("should not allow registration with invalid email format", async () => {
  const userData = { email: "invalidemail", password: "Password123!" };
  const response = await request(app).post("/auth/register").send(userData);
  expect(response.statusCode).toBe(400);
});

it("should authenticate user with valid credentials", async () => {
  const userData = { email: "user@example.com", password: "password123" };
  const response = await request(app).post("/auth/login").send(userData);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("token");
  expect(response.body).toHaveProperty("refreshToken");
});

it("should not authenticate user with invalid password", async () => {
  const userData = { email: "user@example.com", password: "WrongPassword!" };
  const response = await request(app).post("/auth/login").send(userData);
  expect(response.statusCode).toBe(401);
  expect(response.body).toHaveProperty("message", "Invalid credentials");
});

it("should not authenticate user with non-existing email", async () => {
  const userData = {
    email: "nonexisting@example.com",
    password: "Password123!",
  };
  const response = await request(app).post("/auth/login").send(userData);
  expect(response.statusCode).toBe(401);
  expect(response.body).toHaveProperty("message", "Invalid credentials");
});

it("should not authenticate user without a password", async () => {
  const userData = { email: "user@example.com" };
  const response = await request(app).post("/auth/login").send(userData);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

it("should not authenticate user without an email", async () => {
  const userData = { password: "Password123!" };
  const response = await request(app).post("/auth/login").send(userData);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Invalid input");
});

it("should refresh access token with valid refresh token", async () => {
  const email = "user@example.com";
  const refreshToken = await getRefreshTokenForUser(email);

  const response = await request(app)
    .post("/auth/token")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ refreshToken });

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("token");
  expect(response.body).toHaveProperty("refreshToken");
});

it("should not refresh access token with invalid refresh token", async () => {
  const response = await request(app)
    .post("/auth/token")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ refreshToken: "invalidRefreshTokenHere" });
  expect(response.statusCode).toBe(403);
  expect(response.body).toHaveProperty(
    "message",
    "Refresh token is invalid or has expired"
  );
});

it("should require a refresh token to refresh access token", async () => {
  const response = await request(app)
    .post("/auth/token")
    .set("Authorization", `Bearer ${userToken}`)
    .send({});
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("message", "Refresh token is required");
});

it("should not allow logout without access token", async () => {
  const response = await request(app).post("/auth/logout");
  expect(response.statusCode).toBe(401);
  expect(response.body).toHaveProperty("message", "Unauthorized");
});

const getRefreshTokenForUser = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      refreshTokens: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!user || !user.refreshTokens || user.refreshTokens.length === 0) {
    return null;
  }

  return user.refreshTokens[0].token;
};
