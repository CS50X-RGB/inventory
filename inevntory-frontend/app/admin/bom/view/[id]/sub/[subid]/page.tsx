"use client";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getData, postData } from "@/core/api/apiHandler";
import { bomRoutes, partNumbersRoutes, uomRoutes } from "@/core/api/apiRoutes";
import SubAssemblyCard from "@/components/Card/SubAssemblyCard";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { Button } from "@heroui/button";
import { Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { AssemblyLineCreate } from "@/types/SubAssemblyInterface";
import CustomModal from "@/components/Modal/CustomModal";
import { useDisclosure } from "@heroui/react";
import SearchInput from "@/components/AutoComplete";

export default function SubAssemblyById() {
  const { subid, id } = useParams();
  const [subAssemblyObject, setSubAssemblyObject] = useState<AssemblyLineCreate>({
    name: "",
    level: 2,
    required_qty: 0,
    unit_cost: 0,
    partNumber: "",
    parent_id: String(subid),
    parent_model: "AssemblyLine",
    uom: ""
  });
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const handleChange = (e: string, type: string) => {
    setSubAssemblyObject((prev) => ({
      ...prev,
      [type]: e
    }));
  };
  const { data: getSubAssemblyData, isFetching, isFetched, refetch } = useQuery({
    queryKey: ["get_sub_Assembly_id", subid],
    queryFn: () => {
      return getData(`${bomRoutes.getSubAssemblyDetails}/${subid}`, {});
    }
  });
  useEffect(() => {
    if (isFetched) {
      console.log(getSubAssemblyData?.data.data);
      const level = getSubAssemblyData?.data.data.level;

      setSubAssemblyObject((prev) => ({
        ...prev,
        level: level + 1
      }));
    }
  }, [isFetching, isFetched]);

  const [isLoading, setIsLoading] = useState(false);
  const createSubAssembly = useMutation({
    mutationKey: ["create_sub_child_assembly"],
    mutationFn: async (data: any) => {
      return await postData(`${bomRoutes.addSubAssembly}/${id}/${subid}`, {}, data);
    },
    onSuccess: (data: any) => {
      console.log(data, "Success");
      setIsLoading(false);
      refetch();
      onClose();
    },
    onError: (error: any) => {
      setIsLoading(false);
      onClose();
    },
    onSettled: () => {
      setIsLoading(false);
    },
    onMutate: () => {
      setIsLoading(true);
    },
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createSubAssembly.mutate(subAssemblyObject);
  };

  if (isFetching) {
    return <BomLoadingCardSkeleton />;
  }
  return (
    <>
      <div className="flex flex-col font-bold text-xl gap-4 items-center w-full">
        <SubAssemblyCard sub={getSubAssemblyData?.data?.data} add={false} link={`{}`} />
        <div className="flex justify-end w-1/3">
          <Button onPress={onOpen} color="primary">Add Sub Assembly</Button>
        </div>
        {getSubAssemblyData?.data.data.child_id.map((child: any, index: number) => {
          return <SubAssemblyCard key={index} sub={child} add={true} link={`/admin/bom/view/${id}/sub/${child._id}`} />
        })}
      </div>
      <CustomModal
        bottomContent={<></>}
        heading="Create Child Assembly"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col p-4 gap-4">
          <Input type="text" label="Name" onValueChange={(e) => handleChange(e, "name")} value={`${subAssemblyObject.name}`} />
          <Input type="number" label="Level" onValueChange={(e) => handleChange(e, "level")} value={String(subAssemblyObject.level)} />
          <Input type="number" label="Required Qty" onValueChange={(e) => handleChange(e, "required_qty")} value={String(subAssemblyObject.required_qty)} />
          <Input type="number" label="Unit Cost" onValueChange={(e) => handleChange(e, "unit_cost")} value={String(subAssemblyObject.unit_cost)} />
          <SearchInput api={partNumbersRoutes.searchByPart} type="partNumber" setState={handleChange} state={subAssemblyObject.partNumber} label={"Select Part Numbers"} />
          <SearchInput api={uomRoutes.getAllUom} type="uom" setState={handleChange} state={subAssemblyObject.uom} label="Unit Of Measurement" />
          <Button isLoading={isLoading} type="submit" color="primary">Submit</Button>
        </form>
      </CustomModal>
    </>
  )
}
