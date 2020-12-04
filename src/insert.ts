import { gql } from "apollo-boost";
import { client } from "./ApolloClient";
import { Card } from "./type";

export default async function insert(variables: { data: Card[] }) {
  const res = await client.mutate({
    mutation: gql`
      mutation($data: [eland_cards_insert_input!]!) {
        insert_eland_cards(objects: $data) {
          affected_rows
        }
      }
    `,
    variables,
  });
  return res.data?.insert_eland_cards?.affected_rows;
}
