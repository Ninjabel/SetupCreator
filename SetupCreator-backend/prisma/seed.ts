import { PrismaClient, Role } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const databaseUrl = process.env.DATABASE_URL;
const refreshSecret = process.env.REFRESH_SECRET;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

const users = [
  { email: "user@example.com", password: "password123", role: Role.USER },
  { email: "admin@example.com", password: "adminpassword", role: Role.ADMIN },
  { email: "user2@example.com", password: "password123", role: Role.USER },
  { email: "user3@example.com", password: "password123", role: Role.USER },
  { email: "user4@example.com", password: "password123", role: Role.USER },
];

const seedUsersAndRefreshTokens = async () => {
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    console.log(`Created user: ${createdUser.email}`);

    const refreshToken = jwt.sign(
      { id: createdUser.id, role: createdUser.role },
      refreshSecret!,
      { expiresIn: "7d" }
    );

    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: createdUser.id,
        token: refreshToken,
        expiresAt: expirationDate,
      },
    });

    console.log(`Created refresh token for user: ${createdUser.email}`);
  }
};

const categories = [
  {
    name: "Karty graficzne",
    products: [
      { name: "RTX 3080", ceneoId: 103514745 },
      { name: "RTX 3070", ceneoId: 103514745 },
      { name: "RTX 3060 Ti", ceneoId: 103514745 },
    ],
  },
  {
    name: "Procesory",
    products: [
      { name: "i9-10900K", ceneoId: 103514745 },
      { name: "i7-10700K", ceneoId: 103514745 },
      { name: "i5-10600K", ceneoId: 103514745 },
    ],
  },
  {
    name: "Płyty główne",
    products: [
      { name: "Z490", ceneoId: 103514745 },
      { name: "B460", ceneoId: 103514745 },
      { name: "H410", ceneoId: 103514745 },
    ],
  },
  {
    name: "Pamięci RAM",
    products: [
      { name: "DDR4 16GB", ceneoId: 103514745 },
      { name: "DDR4 32GB", ceneoId: 103514745 },
      { name: "DDR4 64GB", ceneoId: 103514745 },
    ],
  },
  {
    name: "Dyski twarde",
    products: [
      { name: "HDD 1TB", ceneoId: 103514745 },
      { name: "HDD 2TB", ceneoId: 103514745 },
      { name: "HDD 4TB", ceneoId: 103514745 },
    ],
  },
  {
    name: "Zasilacze",
    products: [
      { name: "550W", ceneoId: 103514745 },
      { name: "650W", ceneoId: 103514745 },
      { name: "750W", ceneoId: 103514745 },
    ],
  },
  {
    name: "Obudowy",
    products: [
      { name: "ATX", ceneoId: 103514745 },
      { name: "Micro ATX", ceneoId: 103514745 },
      { name: "Mini ITX", ceneoId: 103514745 },
    ],
  },
];

const seedCategoriesAndProducts = async () => {
  for (const category of categories) {
    const cat = await prisma.category.create({
      data: { name: category.name },
    });

    console.log(`Created category: ${cat.name}`);

    for (const [index, product] of category.products.entries()) {
      const isPromoted = index === 0;

      await prisma.product.create({
        data: {
          name: product.name,
          category: { connect: { id: cat.id } },
          ceneoId: product.ceneoId.toString(),
          isPromoted: isPromoted,
        },
      });

      console.log(`Created product: ${product.name} - Promoted: ${isPromoted}`);
    }
  }
};

const seedSetups = async () => {
  const allUsers = await prisma.user.findMany();
  const products = await prisma.product.findMany();

  if (products.length === 0) {
    console.log("No products found for creating setups.");
    return;
  }

  const usersWithSetups = allUsers.slice(0, 3);

  for (const user of usersWithSetups) {
    const selectedProducts = products
      .slice(0, 3)
      .map((product) => ({ id: product.id }));

    const setup = await prisma.setup.create({
      data: {
        name: `Setup for ${user.email}`,
        userId: user.id,
        products: { connect: selectedProducts },
      },
    });

    console.log(`Created setup: ${setup.name} for user: ${user.email}`);
  }

  const usersWithoutSetups = allUsers.slice(3);
  usersWithoutSetups.forEach((user) => {
    console.log(`User with no setup: ${user.email}`);
  });
};

const seed = async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.setup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();

  await seedCategoriesAndProducts();
  await seedUsersAndRefreshTokens();
  await seedSetups();
};

seed()
  .then(async () => {
    console.log("Seeding completed.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export const main = seed;
