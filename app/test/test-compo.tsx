"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/lib/actions/order";
import { useGetOrders } from "@/lib/react-query/queries";
import { SearchParams } from "@/types/table";

interface TestCompoProps {
  housePromise: ReturnType<typeof getOrders>;
  searchParams: SearchParams;
}

const TestCompo = ({ housePromise, searchParams }: TestCompoProps) => {
  const { data, pageCount, error } = React.use(housePromise);

  const { data: clientData, isLoading } = useGetOrders(searchParams);

  console.log(clientData);
  return (
    <>
      <div>TestCompo call data and see in terminal</div>
    </>
  );
};

export default TestCompo;
