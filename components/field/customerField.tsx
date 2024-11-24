import React from "react";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const CustomerStatusField = ({ isAdult }: { isAdult: boolean }) => {
  return (
    <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-10/12">
      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
        Customer Type
      </FormLabel>
      <FormControl>
        <div className="h-10 px-3 py-2 flex items-center bg-white border border-gray-300 dark:bg-slate-500 rounded-md">
          {isAdult ? "Adult" : "Child"}
        </div>
      </FormControl>
    </FormItem>
  );
};

export default CustomerStatusField;
