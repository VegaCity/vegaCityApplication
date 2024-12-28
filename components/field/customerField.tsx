import React from "react";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const CustomerStatusField = ({ isAdult }: { isAdult: boolean }) => {
  return (
    <FormItem className="flex flex-col gap-1 md:w-12/12">
      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
        Customer Type
      </FormLabel>
      <FormControl>
        <div className="h-10 px-3 py-2 bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white">
          {isAdult ? "Adult" : "Child"}
        </div>
      </FormControl>
    </FormItem>
  );
};

export default CustomerStatusField;
