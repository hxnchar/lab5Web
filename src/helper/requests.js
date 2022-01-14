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

  static DeleteById = idToBeDeleted => `
    mutation MyMutation {
      delete_laba5_Debtors_by_pk(id: "${idToBeDeleted}") {
        Surname
        Name
        Debt
      }
    }
  `;
}
