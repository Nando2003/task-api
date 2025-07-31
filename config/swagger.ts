import url from "node:url";
import path from "node:path";

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + "/../",
  title: "Tasks API",
  description: "",
  version: "1.0.0",
  tagIndex: 1,
  snakeCase: true,
  ignore: ["/swagger", "/docs"],
  preferredPutPatch: "PUT", 
  common: {
    parameters: {},
    headers: {},
  },
  authMiddlewares: ["jwtAuth"],
  persistAuthorization: true,
  securitySchemes: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Write your_access_token here",
    },
    BasicAuth: {},
    ApiKeyAuth: {},
  },
  defaultSecurityScheme: "BearerAuth",
}