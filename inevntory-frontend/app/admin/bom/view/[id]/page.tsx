"use client";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    useDisclosure,
} from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import CustomModal from "@/components/Modal/CustomModal";
import { getData, postData } from "@/core/api/apiHandler";
import { bomRoutes, partNumbersRoutes, uomRoutes } from "@/core/api/apiRoutes";
import { useState } from "react";
import { AssemblyLineCreate } from "@/types/SubAssemblyInterface";
import SearchInput from "@/components/AutoComplete";
import SubAssemblyCard from "@/components/Card/SubAssemblyCard";


export default function CreateLineToBom() {
    const { id } = useParams();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const { data: bomObject, isFetching, refetch } = useQuery({
        queryKey: ["get-bom_id", id],
        queryFn: async () => {
            return await getData(`${bomRoutes.getSingleBom}${id}`, {});
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const createSubAssembly = useMutation({
        mutationKey: ["create_sub_assembly"],
        mutationFn: async (data: any) => {
            return await postData(`${bomRoutes.addSubAssembly}/${id}`, {}, data);
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
    const [subAssemblyObject, setSubAssemblyObject] = useState<AssemblyLineCreate>({
        name: "",
        level: 1,
        required_qty: 0,
        unit_cost: 0,
        partNumber: "",
        parent_id: String(id),
        parent_model: "BOM",
        uom: ""
    });
    if (isFetching) {
        return <BomLoadingCardSkeleton />;
    }
    const handleChange = (e: string, type: string) => {
        setSubAssemblyObject((prev) => ({
            ...prev,
            [type]: e
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createSubAssembly.mutate(subAssemblyObject);
    };
    return (
        <>
            <div className="flex flex-col gap-4 items-center font-bold w-full p-2 md:p-4">
                <Card className="w-full md:w-1/2 p-4">
                    <CardHeader>Top Level Part {bomObject?.data.data.name}</CardHeader>
                    <CardBody className="flex flex-col gap-2">
                        <div className="flex flex-row w-full justify-between items-center">
                            <div className="flex flex-col gap-4 p-4">
                                <p>Top Level Description {bomObject?.data.data.description}</p>
                                <p>Total Price {bomObject?.data.data.total_price}</p>
                            </div>
                            <Button onPress={() => onOpen()} className="text-sm" color="primary" size="sm">
                                Add Sub Assembly
                            </Button>
                        </div>
                    </CardBody>
                </Card>
                {bomObject?.data.data.sub_line.map((sub_line: any, index: number) => {
                    return <SubAssemblyCard link={`/admin/bom/view/${id}/sub/${sub_line._id}`} add={true} sub={sub_line} key={index} />
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
    );
}
