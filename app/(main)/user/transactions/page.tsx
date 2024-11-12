import Link from "next/link";
import BackButton from "@/components/BackButton";
import TransactionTable from "@/components/transactions/TransactionTable";

const TransactionsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <TransactionTable />
    </div>
  );
};

export default TransactionsPage;
