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
