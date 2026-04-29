import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERNShop API",
      version: "1.0.0",
      description: "Production-ready REST API for MERNShop — built with Node.js, Express, MongoDB & TypeScript",
      contact: { name: "MERNShop", email: "dev@mernshop.com" },
    },
    servers: [
      { url: "http://localhost:5000", description: "Local development" },
      { url: "https://your-backend.render.app", description: "Production (Render)" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            originalPrice: { type: "number" },
            image: { type: "string" },
            rating: { type: "number", minimum: 0, maximum: 5 },
            reviewCount: { type: "integer" },
            category: { type: "string", enum: ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"] },
            badge: { type: "string", enum: ["New", "Sale", "Hot"] },
            description: { type: "string" },
            stock: { type: "integer" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["customer", "admin", "moderator"] },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string" },
            totalAmount: { type: "number" },
            status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
            items: { type: "array" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            code: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
