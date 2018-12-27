import * as dotenv from "dotenv";

const result = dotenv.config()

if (result.error) {
  console.log(result.error);
  throw result.error
}

console.log(result.parsed)

export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
export const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
export const AUTH0_MANAGEMENT_IDENTIFIER = process.env.AUTH0_MANAGEMENT_IDENTIFIER;
export const COUCH_HOST = process.env.COUCH_HOST;
export const COUCH_PROTOCOL = process.env.COUCH_PROTOCOL;
export const COUCH_PORT = process.env.COUCH_PORT;
export const COUCH_ADMIN_USER = process.env.COUCH_ADMIN_USER;
export const COUCH_ADMIN_PASSWORD = process.env.COUCH_ADMIN_PASSWORD;