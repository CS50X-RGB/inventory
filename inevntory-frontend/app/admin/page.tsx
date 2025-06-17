'use client';
import React from "react";
import CustomTable from "@/components/CustomTable";
import { getData } from "@/core/api/apiHandler";
import { accountRoutes, analyticsRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import CountCard from "@/components/Card/CountCard";
import GraphCard from "@/components/Card/GraphCard";
import PieChart from "@/components/Graphs/PieChart";
import BarGraph from "@/components/Graphs/BarChart";



export default function Page() {
  const [page, setPage] = useState<number>(1);
  const { data: getAllUsers, isFetching } = useQuery({
    queryKey: ["get-all-users", page],
    queryFn: async () => {
      return await getData(`${accountRoutes.allUsers}/?page=${page}&offset=5`, {});
    }
  });

  const { data: getAnalytics, isFetching: isFetchingAnalytics } = useQuery({
    queryKey: ["getAnalytics"],
    queryFn: async () => {
      return getData(analyticsRoutes.getData, {});
    }
  });
  const { data: getPlanningAnalytics, isFetching: isFetchingPlanningAnalytics } = useQuery({
    queryKey: ["getPlanningAnalytics"],
    queryFn: async () => {
      return getData(analyticsRoutes.getPlanning, {});
    }
  });



  if (isFetchingAnalytics && isFetching && isFetchingPlanningAnalytics) {
    return (
      <div className="flex flex-row items-center justify-center h-[80vh]">
        <Spinner />
      </div>
    )
  } else {

    return (
      <div className="flex flex-col gap-4 p-4">

        <div className="flex flex-wrap gap-4 flex-row w-full justify-center items-center">
          {getAnalytics?.data?.data &&
            Object.entries(getAnalytics.data.data).map(([key, value]: [any, any], index: number) => (
              <CountCard key={index} label={key} value={value} />
            ))}
          <div className="flex flex-row-reverse items-center gap-4 justify-around w-full">
            <div className="w-1/3 gap-4 flex flex-col h-full">
              <GraphCard label="Total Planning" value={getPlanningAnalytics?.data?.data?.planning?.total}>
                {getPlanningAnalytics?.data.data && (
                  <PieChart title="Planning Stats" data={getPlanningAnalytics?.data?.data?.planning?.statusCount} />
                )}
              </GraphCard>
              <Card className="p-4 border border-white">
                <CardHeader className="text-2xl font-bold">Percentage Split of All Transactions</CardHeader>
                <CardBody className="flex flex-row w-full h-[200px]">
                  <div
                    style={{
                      width: `${getPlanningAnalytics?.data?.data?.total[0]?.locked || 0}%`,
                    }}
                    className="flex rounded-l-full items-center justify-center h-full bg-blue-400"
                  >
                    <h1 className="font-bold text-sm text-black text-center">
                      Locked {Math.round(getPlanningAnalytics?.data?.data?.total[0]?.locked)}%
                    </h1>
                  </div>
                  <div
                    style={{
                      width: `${getPlanningAnalytics?.data?.data?.total[0]?.realsed || 0}%`,
                    }}
                    className="flex rounded-r-full items-center justify-center h-full bg-green-400"
                  >
                    <h1 className="font-bold text-sm text-black text-center">
                      Released {Math.round(getPlanningAnalytics?.data?.data?.total[0]?.realsed)}%
                    </h1>
                  </div>
                </CardBody>
              </Card>
            </div>
            <Card className="w-1/2 border border-white">
              <CardHeader className="p-4 font-bold text-2xl">Part Number Frequency</CardHeader>
              <CardBody>
                {getPlanningAnalytics?.data.data && (
                  <BarGraph title="Most Used Part Number" data={getPlanningAnalytics?.data?.data?.partNumber?.partNumber} />
                )}
              </CardBody>
            </Card>
          </div>

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
}
