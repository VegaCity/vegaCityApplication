import { SearchParams } from "@/types/table";
import React from "react";
import { getOrders } from "@/lib/actions/order";
import TestCompo from "./test-compo";
export interface IndexPageProps {
  searchParams: SearchParams;
}
const TestPage = ({ searchParams }: IndexPageProps) => {
  const housePromise = getOrders(searchParams);

  return (
    <React.Suspense fallback={<div>...loading</div>}>
      <TestCompo housePromise={housePromise} searchParams={searchParams} />
    </React.Suspense>
  );
};

export default TestPage;
