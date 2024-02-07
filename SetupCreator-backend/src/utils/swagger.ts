import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SetupCreator API",
      version,
      description: "Interactive Swagger Documentation for SetupCreator API.",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role: { $ref: "#/components/schemas/Role" },
            setups: {
              type: "array",
              items: { $ref: "#/components/schemas/Setup" },
            },
            refreshTokens: {
              type: "array",
              items: { $ref: "#/components/schemas/RefreshToken" },
            },
          },
        },
        RefreshToken: {
          type: "object",
          properties: {
            id: { type: "string" },
            token: { type: "string" },
            userId: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            expiresAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            products: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
          },
        },
        Setup: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            userId: { type: "string" },
            products: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
            productIds: { type: "array", items: { type: "string" } },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            category: { $ref: "#/components/schemas/Category" },
            categoryId: { type: "string" },
            setups: {
              type: "array",
              items: { $ref: "#/components/schemas/Setup" },
            },
            setupIds: { type: "array", items: { type: "string" } },
            ceneoId: { type: "string" },
            photoUrl: { type: "string" },
            price: { type: "integer" },
            shopUrl: { type: "string" },
            shopImage: { type: "string" },
            isPromoted: { type: "boolean" },
          },
        },
        Role: {
          type: "string",
          enum: ["USER", "ADMIN"],
        },
      },
    },

    security: [
      {
        BearerAuth: ["BearerAuth"],
      },
    ],
  },
  apis: ["./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

const authenticationRequirementsOperationFilter = {
  AuthenticationRequirements: {
    Apply: (operation: any, context: any) => {
      if (operation.security === undefined) {
        operation.security = [];
      }
      const securityScheme = {
        bearer: [],
      };
      operation.security.push(securityScheme);
    },
  },
};

function configureSwagger(app: Express, port: number) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Docs available at http://localhost:${port}/docs`);
}

export default configureSwagger;
