import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "MeetingBot API",
    version: "1.0.0",
    description: "API documentation for MeetingBot service",
  },
  servers: [
    {
      url: "/api",
      description: "API server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/modules/**/**.router.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
