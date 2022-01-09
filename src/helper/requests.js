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

  static InsertRecord = (Surname, Name, Debt) => `
    mutation MyMutation {
        insert_laba5_Debtors(objects: {Surname: "${Surname}", Name: "${Name}", Debt: ${Debt}}) {
        returning {
            id
            userID
            Surname
            Name
            Debt
        }
        }
    }
    `;

  static DeleteNegative = () => `
    mutation MyMutation {
      delete_laba5_Debtors(where: {Debt: {_lte: 0}}) {
        returning {
          userID
          Surname
          Name
          Debt
        }
      }
    }
  `;
}
