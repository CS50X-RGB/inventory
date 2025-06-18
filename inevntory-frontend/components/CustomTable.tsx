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
  Input,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";

import { useMutation } from "@tanstack/react-query";
import Delete from "@/public/Icons/Delete";
import { deleteData, putData } from "@/core/api/apiHandler";
import { accountRoutes, bomRoutes } from "@/core/api/apiRoutes";
import { queryClient } from "@/app/providers";

import { toast } from "sonner";

import { CheckIcon } from "@/public/Icons/CheckIcon";
import CrossIcon from "@/public/Icons/CrossIcon";
import PencilIcon from "@/public/Icons/PencilIcon";
import CustomModal from "./Modal/CustomModal";
import { useAsyncList } from "@react-stately/data";
import { localBackend } from "@/core/api/axiosInstance";

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

  const deleteById = useMutation({
    mutationKey: ["deletebyId"],
    mutationFn: async (id: any) => {
      return await deleteData(`${accountRoutes.deleteById}/${id}`, {});
    },
    onSuccess: (data: any) => {
      console.log(data.data);
      toast.success("User Deleted Succes",{
          position: "top-right"
      });
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
    PLANNER: "warning",
    SELLER: "secondary",
  };
  const {
    isOpen: isOpenStatus,
    onOpen: onOpenStatus,
    onOpenChange: onOpenChangeStatus,
    onClose: onCloseStatus,
  } = useDisclosure();

  const {
    isOpen: isOpenUser,
    onOpen: onOpenUser,
    onOpenChange: onOpenChangeUser,
    onClose: onCloseUser,
  } = useDisclosure();

  const [updateuserObj, setUpdateUser] = useState<any>(
    {
      name: '',
      email: '',
      password: '',
      role: ''
    }
  );
  const updateUser = useMutation({
    mutationKey: ["updateUser"],
    mutationFn: async (item : any) => {
      return await putData(`${accountRoutes.updateUser}${item?._id}`, {}, item);
    },
    onMutate : () => {
      setloadingUser(true);
    },
    onSettled : () => {
      setloadingUser(false);
    },
    onSuccess : (data : any) => {
      setloadingUser(false);
      console.log(data,"data");
      toast.success("User Details update",{
        position : "top-right"
      });
      onCloseUser();
    },
    onError:(err : any) => {
      console.error(err,"Error");
    }
  });
  const clickPencil = (item: any) => {
    const { password, ...sanitizedItem } = item;
    setUpdateUser(sanitizedItem);
    onOpenUser();
  }
  const [item, setItem] = useState<any>({});
  const clickChip = (item: any) => {
    onOpenStatus();
    setItem(item);
  };
  const [loadingUser, setloadingUser] = useState<boolean>(false);
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
            <PencilIcon className={"size-4 cursor-pointer"} onClick={() => clickPencil(item)} />
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
  const handleChange = (type: any, value: string) => {
    setUpdateUser((prev: any) => ({
      ...prev,
      [type]: value,
    }));
  };
  const handleFormSubmit = (e : any) => {
    setloadingUser(true);
    updateUser.mutate(updateuserObj);
  }
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
      <CustomModal
        isOpen={isOpenUser}
        onOpenChange={onOpenChangeUser}
        heading="Update User"
        bottomContent={
          <div className="flex p-2">
            <Button onPress={onCloseUser} color="danger">
              Close
            </Button>
          </div>
        }
      >
        <form onSubmit={(e) => handleFormSubmit(e)} className="flex flex-col gap-4 p-4">
          <Input
            label="Name"
            type="text"
            isRequired
            placeholder="Write Name"
            value={updateuserObj?.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            isRequired
            placeholder="Write Email"
            value={updateuserObj.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Write Password"
            value={updateuserObj.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          {/* {updateuserObj && list.items.length > 0 && (
            <Autocomplete
              key={String(updateuserObj.role?._id)}
              className="max-w-xl"
              inputValue={list.filterText}
              isLoading={list.isLoading}
              items={list.items}
              selectedKey={String(updateuserObj.role?._id)}
              onSelectionChange={(e) => handleChange("role", e)}
              label="Select Role"
              variant="bordered"
              onInputChange={list.setFilterText}
              isRequired
            >
              {(item: any) => (
                <AutocompleteItem key={item._id} className="capitalize">
                  {item.name}
                </AutocompleteItem>
              )}
            </Autocomplete>
          )} */}
          <Button isLoading={loadingUser} type="submit" color="primary">Submit</Button>
        </form>
      </CustomModal >
    </>
  );
}
