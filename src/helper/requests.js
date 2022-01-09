export class Queries {
  static AllRecords = () => `
    query MyQuery {
      laba5_Debtors {
        id
        userID
        Surname
        Name
        Debt
      }
    }
  `;

  static DeleteRecords = gql`
    mutation MyMutation {
      delete_debtors(where: { debt: { _lte: 0 } }) {
        returning {
          debt
          name
          surname
        }
      }
    }
  `;

  static InsertRecord = gql`
    mutation MyMutation($surname: String, $name: String, $debt: Int = "0") {
      insert_debtors_one(
        object: { surname: $surname, name: $name, debt: $debt }
      ) {
        id
        surname
        name
        debt
      }
    }
  `;
}
