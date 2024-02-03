import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

const seed = async () => {
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();

  for (const category of categories) {
    const cat = await prisma.category.create({
      data: { name: category.name },
    });

    console.log(`Created category: ${cat.name}`);

    for (const product of category.products) {
      await prisma.product.create({
        data: {
          name: product.name,
          category: { connect: { id: cat.id } },
          ceneoId: product.ceneoId.toString(),
        },
      });

      console.log(`Created product: ${product.name}`);
    }
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export const main = seed;
