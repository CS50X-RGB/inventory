'use client';
import ShowTableData from "@/components/ShowTableData";
import { getData } from "@/core/api/apiHandler";
import { bomRoutes } from "@/core/api/apiRoutes";
import { Select, SelectItem } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlanningHistoryViewByName() {
    const [page, setPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pages, setPages] = useState<number>(0);
    const { name } = useParams();
    const [status, setStatus] = useState<string>("all");
    const { data: getBom, isFetching, isFetched } = useQuery({
        queryKey: ["getplanninghistory", page, status],
        queryFn: async () => {
            return getData(`${bomRoutes.getTransaction}/${name}/${page}/5?status=${status}`, {});
        }
    });
    useEffect(() => {
        if (isFetched) {
            console.log(getBom?.data.data);
            const { getTransactions, totalCount } = getBom?.data.data;
            console.log(getTransactions);
            setTotalCount(totalCount);
            setPages(Math.ceil(totalCount / 5));
        }
    }, [isFetching]);
    const columns = [
        {
            "name": "Top Level Name"
        },
        {
            "name": "Quantity"
        },
        {
            "name": "Planning Status"
        }
    ]
    const animals = [
        { key: "all", label: "All" },
        { key: "Locked", label: "Locked" },
        { key: "Released", label: "Released" }
    ]
    return (
        <div className="flex flex-col gap-4 p-8">
            <h1 className="text-xl font-bold">Fetched {totalCount}</h1>
            <Select onSelectionChange={(e) => {
                const value: any = Array.from(e)[0];
                setStatus(value);
            }} className="max-w-xs" label="Select Status">
                {animals.map((animal) => (
                    <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
            </Select>
            <ShowTableData data={getBom?.data.data.getTransactions} columnHeaders={columns} page={page} setPage={setPage} pages={pages} loadingState={isFetching} />
        </div>
    )
}