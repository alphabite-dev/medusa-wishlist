import Medusa from "@medusajs/js-sdk";

export const sdk = new Medusa({
  baseUrl: __BACKEND_URL__ || "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
});
