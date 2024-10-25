import Link from "next/link";
import BackButton from "@/components/BackButton";
import ETagTable from "@/components/etags/ETagTable";
import TransactionTable from "@/components/transactions/TransactionTable";

const TransactionsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />
      </div>
      <TransactionTable />
    </div>
  );
};

export default TransactionsPage;
