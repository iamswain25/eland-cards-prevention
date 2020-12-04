import ApolloClient from "apollo-boost";
import * as dotenv from "dotenv";
import { fetch } from "cross-fetch";
dotenv.config();
const { HASURA_GRAPHQL_ENGINE_URL, HASURA_ADMIN_SECRET } = process.env;
console.log(HASURA_GRAPHQL_ENGINE_URL, HASURA_ADMIN_SECRET);
export const client = new ApolloClient({
  fetch,
  uri: HASURA_GRAPHQL_ENGINE_URL,
  headers: {
    "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    "x-hasura-use-backend-only-permissions": "true",
  },
});
