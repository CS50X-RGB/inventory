'use client';

import { getData } from "@/core/api/apiHandler";
import { partNumbersRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ShowTableData from "@/components/ShowTableData";
import { Input } from "@heroui/input";

export default function ViewPartNumbers() {
    const [page, setPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const { data: getPartNumbers, isFetching, isFetched } = useQuery({
        queryKey: ["getPartNumbers", page, debouncedSearch],
        queryFn: async () => {
            return getData(`${partNumbersRoutes.getAllParts}/${page}/10?search=${debouncedSearch}`, {});
        }
    });
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); 

        return () => clearTimeout(delayDebounce);
    }, [search]);

    const [pages, setPages] = useState<number>(0);
    useEffect(() => {
        if (isFetched) {
            const { data, message } = getPartNumbers?.data;
            console.log(getPartNumbers?.data);
            const count = parseInt(message.split(" ")[0], 10);
            setTotalCount(count);
            setPages(Math.ceil(count / 10));
        }
    }, [isFetching]);
    const columns = [
        {
            "name": "Name"
        },
        {
            "name": "Description"
        },
        {
            "name": "In Stock Qty"
        },
        {
            "name": "Re Order Level"
        },
        {
            "name": "Action"
        }
    ]
    return (
        <div className="flex flex-col gap-4 p-8">
            <Input className="w-1/2" placeholder="Search Part Numbers" onValueChange={(e) => setSearch(e)} />
            <h1 className="text-xl font-bold">Fetched {totalCount} Inventory Part Numbers</h1>
            <ShowTableData data={getPartNumbers?.data.data} columnHeaders={columns} setPage={setPage} page={page} pages={pages} loadingState={isFetching} />
        </div>
    );
}