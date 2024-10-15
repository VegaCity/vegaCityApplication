import { Suspense, useEffect } from "react";
import { notFound } from "next/navigation";
import HouseDetailsPage from "./page";
import { HouseType } from "@/types/house";
import { HouseServices } from "@/components/services/houseServices";

export default async function HouseDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
