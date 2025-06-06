'use client';
import CustomTable from "@/components/CustomTable";
import { getData } from "@/core/api/apiHandler";
import { accountRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Page() {
  const [page, setPage] = useState<number>(1);
  const { data: getAllUsers, isFetching } = useQuery({
    queryKey: ["get-all-users", page],
    queryFn: async () => {
      return await getData(`${accountRoutes.allUsers}/?page=${page}&offset=5`, {});
    }
  });

  return (
    <CustomTable
      data={getAllUsers?.data.data.users}
      loadingState={isFetching}
      page={page}
      setPage={setPage}
      pages={1}
    />
  );
}
