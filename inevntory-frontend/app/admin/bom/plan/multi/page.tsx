'use client';

import { getData, postData } from "@/core/api/apiHandler";
import { bomRoutes } from "@/core/api/apiRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Table, TableBody, TableHeader, TableColumn, TableCell, TableRow, Spinner, Pagination, Button, Input } from "@heroui/react";
import { queryClient } from "@/app/providers";
import { useRouter } from "next/navigation";

export default function MultiBoms() {
    const [page, setPage] = useState<number>(1);
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [totalCount, setTotalCount] = useState<number>(0);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState<string>("");
    const [bomId, setBomId] = useState<Set<string>>(new Set());
    const [isLoadingData, setisLoadingData] = useState<boolean>(false);
    const { data: getBom, isFetching, isFetched } = useQuery({
        queryKey: ["getBOMS", page, debouncedSearch],
        queryFn: async () => {
            return getData(`${bomRoutes.getBom}/${page}/10?search=${debouncedSearch}`, {});
        }
    });

    const router = useRouter();
    const multiData = useMutation({
        mutationKey: ["multiKey"],
        mutationFn: (data: any) => {
            console.log(data, "data");
            return postData(bomRoutes.multiInfor, {}, data);
        },
        onMutate: () => {
            setisLoadingData(true);
        },
        onSettled: () => {
            setisLoadingData(false);
        },
        onSuccess: (data: any) => {
            localStorage.setItem("multiKey", JSON.stringify(data.data));
            queryClient.setQueryData(["multiKey"], data.data);
            router.push("/admin/bom/plan/multi/view");
            console.log(data.data, "Response");
        },
        onError: (error: any) => {
            console.error(error, "error");
        }
    })
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    const [pages, setPages] = useState<number>(0);
    useEffect(() => {
        if (isFetched) {
            const { data, message } = getBom?.data;
            setData(data);
            data.map((item: any, _: number) => {
                console.log(item, "Item");
            });
            const count = parseInt(message.split(" ")[0], 10);
            setTotalCount(count);
            setPages(Math.ceil(count / 10));
        }
    }, [isFetching]);
    const colums: Record<string, string>[] = [
        {
            "name": "Top Level Name",
        },
        {
            "name": "Top Level Description"
        },
        {
            "name": "Top Level Price"
        }
    ];
    const handleSelection = (e: any): void => {
        console.log(typeof e);
        if (e === "all") {
            const allIds = data.map((item: any) => item._id);
            const allIdSet = new Set(allIds);

            const isAllSelected = allIds.every((id: any) => bomId.has(id));

            if (isAllSelected) {
                setBomId(new Set());
            } else {
                // Select all
                setBomId(new Set(allIds));
            }
        } else {
            const ids: string[] = Array.from(e) as string[];

            setBomId(new Set(ids));
        }
        console.log(bomId, "Bom Id");
    };

    useEffect(() => {
        console.log(bomId, "Updated BomId");
    }, [bomId]);


    const getValue = (item: any, columnKey: any): React.ReactNode => {
        console.log(item.total_price, columnKey, "Column");
        switch (columnKey) {
            case "Top Level Name":
                return <p>{item.name}</p>
            case "Top Level Description":
                return <p>{item.description}</p>
            case "Quantity Planned":
                return <p>{item.qty}</p>
            case "Top Level Price":
                return <p>Rs {Math.round(Number(item?.total_price))}</p>
            default:
                return <p className="text-sm font-bold">{item[columnKey.toLowerCase()]}</p>;
        }
    };
    return (
        <div className="flex flex-col p-4 gap-5">
            <h1 className="font-bold text-2xl">View Boms</h1>
            <Input className="w-1/2" placeholder="Search Top Level Part Numbers" onValueChange={(e) => setSearch(e)} />
            <Table
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                        />
                    </div>
                }
                aria-label="Example static collection table"
                defaultSelectedKeys={bomId}
                onSelectionChange={(e) => handleSelection(e)}
                selectionMode="multiple"
            >
                <TableHeader>
                    {colums.map((c: Record<string, string>, index: number) => {
                        return <TableColumn key={c.name}>{c.name}</TableColumn>
                    })}
                </TableHeader>

                <TableBody
                    items={data ?? []}
                    loadingContent={<Spinner />}
                    isLoading={isFetching}
                >
                    {(item) => (
                        <TableRow key={item._id}>
                            {(columnKey) => (
                                <TableCell>{getValue(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {bomId.size > 0 && (
                <div className="flex justify-end w-full">
                    <Button onPress={() => multiData.mutate({ bomId: Array.from(bomId) })} isLoading={isLoadingData} color="primary">Submit</Button>
                </div>
            )}
        </div>
    )
}