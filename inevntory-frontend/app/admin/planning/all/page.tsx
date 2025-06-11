'use client';
import ShowTableData from "@/components/ShowTableData";
import { getData } from "@/core/api/apiHandler";
import { bomRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function PlanningViewAll() {
    const [page, setPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pages, setPages] = useState<number>(0);
    const { data: getBom, isFetching, isFetched } = useQuery({
        queryKey: ["getplanning", page],
        queryFn: async () => {
            return getData(`${bomRoutes.getPlanning}/${page}/5`, {});
        }
    });
    useEffect(() => {
        if (isFetched) {
            const { data, count } = getBom?.data.data;
            console.log(data,"data");
            setTotalCount(count);
            setPages(Math.ceil(count / 5));
        }
    }, [isFetching]);
    const columns = [
        {
            "name" : "Top Level Assembly"
        },
        {
            "name" : "Quantity Planned"
        },
        {
            "name" : "Planning Actions"
        }
    ]
    return (
        <div className="flex flex-col gap-4 p-8">
            <h1 className="text-xl font-bold">Fetched {totalCount} BOMs</h1>
            <ShowTableData data={getBom?.data?.data.data} columnHeaders={columns} page={page} setPage={setPage} pages={pages} loadingState={isFetching} />
        </div>
    )
}