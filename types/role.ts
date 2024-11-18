export interface Role {
  id: string;
  name: string;
  deflag: boolean;
  users: [null];
}

export const roles: Role[] = [
  {
    id: "aaed21af-b2a0-401a-9ea3-ce263d0c7bd7",
    name: "Admin",
    deflag: false,
    users: [null],
  },
  {
    id: "010b5d47-6b61-4dc6-9f9b-6f3823615e8c",
    name: "CashierWeb",
    deflag: false,
    users: [null],
  },
  {
    id: "bca98a9f-8daf-4e06-9c07-ea847b703cd7",
    name: "Store",
    deflag: false,
    users: [null],
  },
  {
    id: "e0a506e1-57d1-4115-8a03-efe58bffb661",
    name: "CashierApp",
    deflag: false,
    users: [null],
  },
];
