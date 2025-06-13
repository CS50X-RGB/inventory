'use client';
import CustomTable from "@/components/CustomTable";
import { getData } from "@/core/api/apiHandler";
import { accountRoutes,analyticsRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {Spinner} from "@heroui/react";
import CountCard from "@/components/Card/CountCard";

export default function Page() {
  const [page, setPage] = useState<number>(1);
  const { data: getAllUsers, isFetching } = useQuery({
    queryKey: ["get-all-users", page],
    queryFn: async () => {
      return await getData(`${accountRoutes.allUsers}/?page=${page}&offset=5`, {});
    }
  });
  const {data : getAnalytics,isFetching: isFetchingAnalytics} = useQuery({
    queryKey : ["getAnalytics"],
    queryFn : async () => {
      return getData(analyticsRoutes.getData,{});
    }
  }); 
  if(isFetchingAnalytics && isFetching){
    return (
      <div className="flex flex-row items-center justify-center h-[80vh]">
        <Spinner  />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">

  <div className="flex flex-wrap gap-4 flex-row w-full items-center">
    {getAnalytics?.data?.data &&
      Object.entries(getAnalytics.data.data).map(([key, value]: [any, any], index: number) => (
        <CountCard key={index} label={key} value={value} />
      ))}
    </div>
    <div className="flex flex-col gap-4 w-full">
      <h1 className="font-bold text-xl">View Users</h1>
      <CustomTable
        data={getAllUsers?.data.data.users}
        loadingState={isFetching}
        page={page}
        setPage={setPage}
        pages={1}
      />
    </div>
    </div>
  );
}
