'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableHeader, TableColumn, TableCell, TableRow, Spinner, Pagination, Button, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { postData } from "@/core/api/apiHandler";
import { bomRoutes } from "@/core/api/apiRoutes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ViewMulti() {
    const queryClient = useQueryClient();
    const [data, setData] = useState<any>([]);
    const { data: selectedBom, isFetched, isFetching } = useQuery({
        queryKey: ["multiKey"],
        queryFn: () => {
            const cached = queryClient.getQueryData(["multiKey"]);
            if (!cached) throw new Error("No data in cache");
            return Promise.resolve(cached);
        },
        staleTime: Infinity,
    });
    const router = useRouter();
    const [assignedQuantities, setAssignedQuantities] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isFetched) {
            // if (!selectedBom) {
            const raw = localStorage.getItem("multiKey");
            if (raw) {
                const parsed = JSON.parse(raw);
                console.log(parsed?.data?.allBOMs, "LocalStorage Data");
                setData(parsed?.data?.allBOMs || []);
                // }
                // } else {
                //     console.log(selectedBom.data.allBOMs, "Fetched Data");
                //     setData(selectedBom?.data?.allBOMs || []);
                // }
            }
        }
    }, [isFetching, isFetched, selectedBom]);
    useEffect(() => {
        if (data.length > 0 && isFetched) {
            const initialQuantities: Record<string, string> = {};
            data.forEach((item: any) => {
                initialQuantities[item.bomId] = "1";
            });
            setAssignedQuantities(initialQuantities);
        }
    }, [data]);
    console.log(assignedQuantities, "qty");

    const columns: Record<string, string>[] = [
        {
            "name": "Top Level Name"
        },
        {
            "name": "Top Level Description",
        },
        {
            "name": "Total Price",
        },
        {
            "name": "Maximum Boms",
        },
        {
            "name": "Assign Quantity"
        }
    ]
    const [isPlanning, setisPlanning] = useState<boolean>(false);
    const createPlanningForAll = useMutation({
        mutationKey: ["createPlanningForAll"],
        mutationFn: () => {
            return postData(bomRoutes.lockPlanForAll, {}, { assignedQuantities });
        },
        onSettled: () => {
            setisPlanning(false);
        },
        onMutate: () => {
            setisPlanning(true);
        },
        onSuccess: (data: any) => {
            console.log(data.data, "data");
            toast.success("Planning Successfull", {
                position: "top-right"
            })
            router.push("/admin/planning/all");
            localStorage.removeItem("multiKey");
        },
        onError: (error: any) => {
            toast.error("Planning failed");
            setisPlanning(false);
            console.log(error);
        }

    })

    const getValue = (item: any, columnKey: any): React.ReactNode => {
        switch (columnKey) {
            case 'Top Level Name':
                return <p>{item.bomInfo.name}</p>
            case "Top Level Description":
                return <p>{item.bomInfo.description}</p>
            case "Quantity Planned":
                return <p>{item.qty}</p>
            case "Maximum Boms":
                return <p>{item.maxBom}</p>
            case "Assign Quantity":
                console.log(assignedQuantities[item.bomId], "Item");
                return (
                    <Input
                        required={true}
                        type="number"
                        max={item.maxBom}
                        onChange={(e) => {
                            setAssignedQuantities((prev: Record<string, string>) => ({
                                ...prev,
                                [item.bomId]: e.target.value,
                            }));
                        }}
                    />
                );
            case "Total Price":
                return <p>Rs {Math.round(Number(item.bomInfo.total_price))}</p>
            default:
                return <p className="text-sm font-bold">{item[columnKey.toLowerCase()]}</p>;
        }
    };
    return (
        <div className="flex flex-col gap-4 p-5">
            <h2 className="font-bold text-xl">Multi BOM Viewer</h2>
            <Table
                aria-label="Example static collection table"
            >
                <TableHeader>
                    {columns.map((c: Record<string, string>, index: number) => {
                        return <TableColumn key={c.name}>{c.name}</TableColumn>
                    })}
                </TableHeader>

                <TableBody
                    items={data ?? []}
                    loadingContent={<Spinner />}
                    isLoading={isFetching}
                >
                    {(item: any) => (
                        <TableRow key={item.bomId}>
                            {(columnKey) => (
                                <TableCell>{getValue(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex flex-row w-full justify-end">
                <Button type="submit" onPress={() => createPlanningForAll.mutate()} isLoading={isPlanning} color="primary">Submit</Button>
            </div>
        </div>
    )
}
