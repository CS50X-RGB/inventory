"use client";
import SearchInput from "@/components/AutoComplete";
import { bomRoutes } from "@/core/api/apiRoutes";
import { Input } from "@heroui/input";
import { useState } from "react";
import { Button } from "@heroui/button";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Chip
} from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { postData } from "@/core/api/apiHandler";

export default function SingleSearchBom() {
    const [bom, setBom] = useState<any>({ bom: "", qty: 0 });
    const [isLoading, setisLoading] = useState(false);
    const [bomData, setbomData] = useState([]);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [redLineageIds, setRedLineageIds] = useState<Set<string>>(new Set());
    const [shortfalled, setShortFalled] = useState<any>([]);
    const [maxmBomx, setmaxmBoms] = useState<number>(0);
    const [isLoadingPlanning, setisPlanningPlanning] = useState<boolean>(false);
    const handleChange = (e: string, type: string) => {
        setBom((prev: any) => ({
            ...prev,
            [type]: e,
        }));
    };
    const planBom = useMutation({
        mutationKey: ["create_bom_planning"],
        mutationFn: async () => {
            return await postData(`${bomRoutes.planBomObject}/${bom.bom}`, {}, { qty: Math.min(bom.qty, maxmBomx) });
        },
        onMutate: () => {
            setisPlanningPlanning(true);
        },
        onSettled: () => {
            setisPlanningPlanning(false);
        },
        onSuccess: (data: any) => {
            console.log(data.data);
            getData.mutate();
        },
        onError: (error: any) => {
            console.log(error, "Error");
        }
    })
    const getData = useMutation({
        mutationKey: ["get_bom_object", bom.bom],
        mutationFn: () => {
            return postData(`${bomRoutes.getbomObject}/${bom.bom}`, {}, { qty: bom.qty });
        },
        onMutate: () => {
            setisLoading(true);
        },
        onSettled: () => {
            setisLoading(false);
        },
        onSuccess: (data: any) => {
            setbomData(data.data.data.bom);
            setmaxmBoms(data.data.data.maxBom);
            setExpandedIds(new Set());
            const redIds = new Set<string>();
            const redItems = bomData.filter(
                (item: any) => Number(item.total_qty) > Number(item.partNumber.in_stock)
            );
            const shortFallItems = data.data.data.bom
                .filter((item: any) => Number(item.total_qty) > Number(item.partNumber.in_stock))
                .map((item: any) => ({
                    ...item,
                    short_by: Number(item.total_qty) - Number(item.partNumber.in_stock),
                }));
            console.log(shortFallItems, "Short fall");
            setShortFalled(shortFallItems);
            const findAncestors = (id: string) => {
                const parent = bomData.find((row: any) => row._id === id)?.parent_id;
                if (parent && !redIds.has(parent)) {
                    redIds.add(parent);
                    findAncestors(parent);
                }
            };

            redItems.forEach((item: any) => {
                redIds.add(item._id);
                findAncestors(item._id);
            });

            setRedLineageIds(redIds);
        },
        onError: (error: any) => {
            console.log(error, "error");
        }
    });

    const columns = [
        "Level",
        "Unit of Measurment",
        "Part Number",
        "In Stock Quantity",
        "Unit Quantity",
        "Total Quantity",
        "Total Unit Price"
    ];
    const shortColumns = [
        "Level",
        "Unit of Measurment",
        "Part Number",
        "In Stock Quantity",
        "Unit Quantity",
        "Total Quantity",
        "Total Unit Price",
        "Short Fall"
    ];
    const getValue = (item: any, columnKey: any): React.ReactNode => {
        switch (columnKey.toLowerCase()) {
            case "unit of measurment":
                return <Chip color="primary">{item.uom.name}</Chip>;
            case "short fall":
                return <p className="text-red-400">{item.short_by}</p>
            case "part number":
                return <p className="text-blue-500">{item.partNumber.name}</p>;
            case "unit quantity":
                return <p>{item.required_qty}</p>;
            case "in stock quantity": {
                const isRed = Number(item.total_qty) > Number(item.partNumber.in_stock);
                const className = (isRed) ? "text-red-500" : "text-green-500";

                return <p className={className}>{item.partNumber.in_stock}</p>;
            }
            case "total quantity":
                return <p>{item.total_qty}</p>;
            case "level":
                let levelColor = "bg-gray-300";
                if (item.level === 1) levelColor = "bg-blue-400";
                else if (item.level === 2) levelColor = "bg-pink-400";
                else if (item.level === 3) levelColor = "bg-orange-400";
                return (
                    <div className="flex flex-row gap-4">
                        <Chip className="text-sm w-2 cursor-pointer h-4" color="primary">{item.child_id.length}</Chip>
                        <Chip className={`rounded-full text-white ${levelColor}`}>
                            {item.level}
                        </Chip>
                    </div>
                );
            case "total unit price":
                return <p>Rs {Math.round(item.total_price)}</p>;
            default:
                return <p>{item[columnKey]}</p>;
        }
    };

    const handleRowClick = (item: any) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);

            if (next.has(item._id)) {
                // collapsing: remove item and all its descendants
                const toRemove = new Set<string>();
                const queue = [item._id];

                while (queue.length > 0) {
                    const currentId = queue.shift()!;
                    toRemove.add(currentId);

                    bomData.forEach((row: any) => {
                        if (row.parent_id === currentId) {
                            queue.push(row._id);
                        }
                    });
                }

                toRemove.forEach((id) => next.delete(id));
            } else {
                next.add(item._id);
            }

            return next;
        });
    };


    const getVisibleRows = () => {
        return bomData.filter((item: any) => {
            if (item.level === 1) return true;
            return expandedIds.has(item.parent_id);
        });
    };


    return (
        <div className="flex flex-row items-center w-full h-[70vh] p-2">
            <div className="flex flex-col items-center gap-4 justify-center p-10">
                <SearchInput
                    api={bomRoutes.searchBom}
                    label="Select Top Level Assembly"
                    state={bom}
                    type="bom"
                    setState={handleChange}
                />
                <Input
                    type="number"
                    placeholder="Enter the quantity"
                    value={bom.qty}
                    onValueChange={(e) => handleChange(e, "qty")}
                />
                <Button
                    isLoading={isLoading}
                    onPress={() => getData.mutate()}
                    className="w-full"
                    color="primary"
                >
                    Submit
                </Button>
                {bomData.length > 0 && maxmBomx && (
                    <div className="flex flex-row gap-4">
                        <Button onPress={() => planBom.mutate()} color="primary">Plan Bom</Button>
                        <h1 className="text-green-500">Maximum Boms that can be created {maxmBomx}</h1>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4 w-screen">
                {bomData && (
                    <Table>
                        <TableHeader>
                            {columns.map((c) => (
                                <TableColumn key={c.toLowerCase()}>{c}</TableColumn>
                            ))}
                        </TableHeader>
                        <TableBody
                            emptyContent={<p>No Sub Assemblies added till now</p>}
                            items={getVisibleRows()}
                            loadingContent={<Spinner />}
                        >
                            {(item: any) => (
                                <TableRow
                                    key={item?._id}
                                    onClick={() => handleRowClick(item)}
                                    data-level={item.level}
                                    data-parent={item.parent_id ?? "null"}
                                >
                                    {(columnKey: any) => (
                                        <TableCell>{getValue(item, columnKey)}</TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
                {shortfalled && shortfalled.length > 0 ? (
                    <div className="flex flex-col gap-4 w-full">
                        <h1 className="text-2xl font-bold">ShortFalled Details</h1>
                        <Table>
                            <TableHeader>
                                {shortColumns.map((c) => (
                                    <TableColumn key={c.toLowerCase()}>{c}</TableColumn>
                                ))}
                            </TableHeader>
                            <TableBody
                                emptyContent={<p>No Sub Assemblies added till now</p>}
                                items={shortfalled}
                                loadingContent={<Spinner />}
                            >
                                {(item: any) => (
                                    <TableRow
                                        key={item._id}
                                    >
                                        {(columnKey: any) => (
                                            <TableCell>{getValue(item, columnKey)}</TableCell>
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <h1 className="text-green-500">Configration can be made</h1>
                )}
            </div>
        </div >
    );
}
