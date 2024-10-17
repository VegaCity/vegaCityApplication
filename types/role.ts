export interface Role {
    id: string;
    name: string;
    isActive: boolean;
}

export const roles: Role[] = [
    { id: "4d2b51ad-9789-4107-beb8-41a1d265d42c", name: "Admin", isActive: false },
    { id: "010b5d47-6b61-4dc6-9f9b-6f3823615e8c", name: "CashierWeb", isActive: false },
    { id: "bca98a9f-8daf-4e06-9c07-ea847b703cd7", name: "Store", isActive: false },
    { id: "e0a506e1-57d1-4115-8a03-efe58bffb661", name: "CashierApp", isActive: false },
];