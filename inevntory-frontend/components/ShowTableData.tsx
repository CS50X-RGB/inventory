import React, { Dispatch, SetStateAction, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Spinner,
    Chip,
    Switch,
    useDisclosure,
    Button,
    Input
} from "@heroui/react";

import { useMutation } from "@tanstack/react-query";
import Delete from "@/public/Icons/Delete";
import { deleteData, putData } from "@/core/api/apiHandler";
import { accountRoutes, bomRoutes, partNumbersRoutes } from "@/core/api/apiRoutes";
import { queryClient } from "@/app/providers";

import { toast } from "sonner";

import { CheckIcon } from "@/public/Icons/CheckIcon";
import CrossIcon from "@/public/Icons/CrossIcon";
import { useRouter } from "next/navigation";
import CustomModal from "./Modal/CustomModal";
import EyeIcon from "@/public/Icons/EyeIcon";

interface CustomTableProps {
    columnHeaders: {
        name: string,
    }[];
    page: number;
    pages: number;
    setPage: Dispatch<SetStateAction<number>>;
    loadingState?: any;
    data: any[];
}

export default function ShowTableData({
    columnHeaders,
    page,
    pages,
    setPage,
    loadingState,
    data,
}: CustomTableProps) {

    const deleteById = useMutation({
        mutationKey: ["deletebyId"],
        mutationFn: async (id: any) => {
            return await deleteData(`${accountRoutes.deleteById}/${id}`, {});
        },
        onSuccess: (data: any) => {
            console.log(data.data);
            toast.success("User Deleted Successfully");
            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            console.error(error);
            toast.error("Error caused while deleting user");
        },
    });
    const router = useRouter();
    const deleteByPartNumberId = useMutation({
        mutationKey: ["deletebyPartNumberId"],
        mutationFn: async (id: any) => {
            return await deleteData(`${partNumbersRoutes.deletePartById}/${id}`, {});
        },
        onSuccess: (data: any) => {
            console.log(data.data);
            toast.success("Part Number Deleted Successfully",
                {
                    position: "top-right"
                }
            );
            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            console.error(error);
            toast.error("Error caused while deleting Part Number");
        },
    });
    const updateBlockById = useMutation({
        mutationKey: ["updateBlockyId"],
        mutationFn: async (id: any) => {
            return await putData(`${accountRoutes.block}/${id}`, {}, {});
        },
        onSuccess: (data: any) => {
            console.log(data.data);
            toast.success("User Status Updated Successfully", {
                position: "top-right",
            });
            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            console.error(error);
            toast.error("Error caused while deleting user", {
                position: "top-right",
            });
        },
    });
    const [isLoadingPlanning, setisLoadingPlanning] = useState<boolean>(false);
    const realsePlanning = useMutation({
        mutationKey: ["realsePlanning"],
        mutationFn: async (item: any) => {
            return await putData(`${bomRoutes.realsePlanning}${item._id}`, {}, {
                qty
            });
        },
        onMutate: () => {
            setisLoadingPlanning(true);
        },
        onSuccess: (data: any) => {
            console.log("Release successful:", data);
            toast.success("Realsed Successfull");
            setisLoadingPlanning(false);
            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            console.error("Error releasing planning:", error);
            toast.error("Realsed Failed");
            setisLoadingPlanning(false);
        },
        onSettled: () => {
            setisLoadingPlanning(false);
        },
    });

    const roleColors: Record<
        string,
        "primary" | "warning" | "success" | "danger" | "default" | "secondary"
    > = {
        ADMIN: "primary",
        BIDDER: "warning",
        SELLER: "secondary",
    };
    const {
        isOpen: isOpenStatus,
        onOpen: onOpenStatus,
        onOpenChange: onOpenChangeStatus,
        onClose: onCloseStatus,
    } = useDisclosure();
    const {
        isOpen: isOpenRealse,
        onOpen: onOpenRealse,
        onOpenChange: onOpenChangeRealse,
        onClose: onCloseRealse,
    } = useDisclosure();
    const [item, setItem] = useState<any>({});
    const clickChip = (item: any) => {
        onOpenStatus();
        setItem(item);
        console.log(item, "Item");
    };
    const [qty, setQty] = useState<string>("0");
    const clickRelase = (item: any) => {
        onOpenRealse();
        setItem(item);
        setQty(item.qty);
    }
    const getValue = (item: any, columnKey: any): React.ReactNode => {
        console.log(columnKey, "Column");
        switch (columnKey) {
            case "role":
                return (
                    <Chip color={roleColors[item.role.name] || "default"}>
                        {item.role.name}
                    </Chip>
                );
            case "Action":
                return (
                    <Delete
                        className={"size-4 fill-red-300 cursor-pointer"}
                        onClick={() => deleteByPartNumberId.mutate(item._id)}
                    />
                );
            case "action":
                return (
                    <div className="flex flex-row gap-4 items-center w-full">
                        <Delete
                            className={"size-4 fill-red-300 cursor-pointer"}
                            onClick={() => deleteById.mutate(item._id)}
                        />
                        {item.isBlocked === false ? (
                            <Chip
                                className="text-sm cursor-pointer"
                                color="success"
                                size="sm"
                                startContent={<CheckIcon size={15} height={6} width={6} />}
                                variant="faded"
                                onClick={() => clickChip(item)}>
                                Online
                            </Chip>
                        ) : (
                            <Chip
                                size="sm"
                                onClick={() => clickChip(item)}
                                className="text-sm cursor-pointer"
                                color="danger"
                                startContent={<CrossIcon height={6} size={15} width={6} />}
                                variant="faded"
                            >
                                Blocked
                            </Chip>
                        )}
                    </div>
                );
            case "In Stock Qty":
                return <p>{item["in_stock"]}</p>;
            case "Re Order Level":
                return <p>{item["reorder_qty"]}</p>;
            case "Top Level Assembly":
                return <p>{item.bomId.name}</p>
            case "Quantity Planned":
                return <p>{item.qty}</p>
            case "Planning Actions":
                return (
                    <EyeIcon className="size-4 cursor-pointer" onClick={() => clickRelase(item)} />
                );
            case "Top Level Name":
                return <p>{item.bomId.name}</p>
            case "Quantity":
                return <p>{item.qty}</p>
            case "Planning Status":
                return (
                    <Chip color={item.status === "Locked" ? "primary" : "success"}>
                        {item.status}
                    </Chip>
                );
            case "Bom_Action":
                return (
                    <div className="flex flex-row">
                        <EyeIcon className="size-4 cursor-pointer" onClick={() => router.push(`/admin/bom/view/${item._id}`)} />
                    </div>
                );
            case "Total Bom Price":
                return <p>Rs {Math.floor(item.total_price)}</p>
            default:
                return <p className="text-sm font-bold">{item[columnKey.toLowerCase()]}</p>;
        }
    };

    return (
        <>
            <Table
                aria-label="Example table with client async pagination"
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
            >
                <TableHeader columns={columnHeaders}>
                    {(column) => (
                        <TableColumn key={column.name}>
                            {(column.name === "Bom_Action") || (column.name === "Planning Actions") ? "Actions" : column.name}
                        </TableColumn>
                    )}
                </TableHeader>

                <TableBody
                    items={data ?? []}
                    loadingContent={<Spinner />}
                    loadingState={loadingState}
                >
                    {(item) => (
                        <TableRow key={item?._id || Math.random().toString()}>
                            {(columnKey) => (
                                <TableCell>{getValue(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <CustomModal
                isOpen={isOpenStatus}
                onOpenChange={onOpenChangeStatus}
                heading="Update Status"
                bottomContent={
                    <div className="flex p-2">
                        <Button onPress={onCloseStatus} color="danger">
                            Close
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col">
                    <Switch
                        onChange={() => updateBlockById.mutate(item._id)}
                        value={item.isBlocked}
                    >
                        User Not Blocked
                    </Switch>
                </div>
            </CustomModal>
            <CustomModal
                isOpen={isOpenRealse}
                onOpenChange={onOpenChangeRealse}
                heading="Realse Quantity"
                bottomContent={
                    <div className="flex p-2">
                        <Button isLoading={isLoadingPlanning} type="submit" onPress={() => realsePlanning.mutate(item)} color="primary">
                            Submit
                        </Button>
                        <Button onPress={onCloseRealse} color="danger">
                            Close
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col">
                    <Input type="number" max={item.qty} min={1} label="Qty" labelPlacement={"outside"} onValueChange={setQty} value={qty} />
                </div>
            </CustomModal>
        </>
    );
}
