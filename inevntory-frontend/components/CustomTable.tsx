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
} from "@heroui/react";

import { useMutation } from "@tanstack/react-query";
import Delete from "@/public/Icons/Delete";
import { deleteData, putData } from "@/core/api/apiHandler";
import { accountRoutes,bomRoutes } from "@/core/api/apiRoutes";
import { queryClient } from "@/app/providers";

import { toast } from "sonner";

import { CheckIcon } from "@/public/Icons/CheckIcon";
import CrossIcon from "@/public/Icons/CrossIcon";

import CustomModal from "./Modal/CustomModal";

interface CustomTableProps {
  page: number;
  pages: number;
  setPage: Dispatch<SetStateAction<number>>;
  loadingState: any;
  data: any[];
}

export default function CustomTable({
  page,
  pages,
  setPage,
  loadingState,
  data,
}: CustomTableProps) {
  const deleteBomById = useMutation({
    mutationKey : ["deleteBomById"],
    mutationFn : async (data : any) => {
      return await deleteDalta(`${bomRoutes.deleteBomById}${data._id}`,{},{});
    }
  });
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
  const [item, setItem] = useState<any>({});
  const clickChip = (item: any) => {
    onOpenStatus();
    setItem(item);
    console.log(item, "Item");
  };
  const getValue = (item: any, columnKey: any): React.ReactNode => {
    switch (columnKey) {
      case "role":
        return (
          <Chip color={roleColors[item.role.name] || "default"}>
            {item.role.name}
          </Chip>
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
                Active
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
      default:
        return <p>{item[columnKey]}</p>;
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
        <TableHeader>
          <TableColumn key="name">User Name</TableColumn>
          <TableColumn key="email">Email</TableColumn>
          <TableColumn key="role">Role</TableColumn>
          <TableColumn key="action">Action</TableColumn>
        </TableHeader>
        <TableBody
          items={data ?? []}
          loadingContent={<Spinner />}
          loadingState={loadingState}
        >
          {(item) => (
            <TableRow key={item?._id}>
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
    </>
  );
}
