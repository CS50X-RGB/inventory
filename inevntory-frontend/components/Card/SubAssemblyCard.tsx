import { Button, Card, CardBody, CardHeader, Chip, useDisclosure } from "@heroui/react";
import CustomModal from "../Modal/CustomModal";
import { useRouter } from "next/navigation";

export default function SubAssemblyCard({ sub, link, add }: { sub: any, link: any, add: boolean }) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const router = useRouter();
    return (
        <>
            <Card className="w-1/2">
                <CardHeader>
                    <div className="flex flex-row w-full justify-between">
                        <h1>Assembly Line {sub.name}</h1>
                        <Chip className="bg-blue-400 shadow-xl">{sub.level}</Chip>
                    </div>
                </CardHeader>
                <CardBody className="flex flex-col gap-4 p-4">
                    <>
                        <Chip color="primary">No of Sub Assemblies {sub.child_id.length}</Chip>
                        <div className="flex flex-col w-1/2">
                            <h1 className="cursor-pointer text-blue-400 bg-clip-text" onClick={() => onOpen()}>Part Number {sub.partNumber.name}</h1>
                            <h1>Required Qty {sub.required_qty}</h1>
                            <h1>Unit Cost {sub.unit_cost}</h1>
                            <h1 className="flex gap-4 w-full">Unit Of Measurement <Chip color="primary">{sub.uom.name}</Chip></h1>
                        </div>
                        {add && (
                            <Button color="primary" onPress={() => router.push(link)}>Add Child Sub Assemblies</Button>
                        )}
                    </>
                </CardBody>
            </Card>
            <CustomModal heading="Part Number" isOpen={isOpen} onOpenChange={onOpenChange} bottomContent={
                <div className="flex justify-end w-full">
                    <Button color="danger" onPress={onClose}>Close</Button>
                </div>
            }>
                <div className="flex flex-col font-bold gap-4 p-4">
                    <h1 className="flex gap-4 w-full">Part Number <span>{sub.partNumber.name}</span></h1>
                    <h1 className="flex gap-4 w-full">Part Description <span>{sub.partNumber.description}</span></h1>
                    <h1 className="flex gap-4 w-full">In Stock Quantity <span>{sub.partNumber.in_stock}</span></h1>
                    <h1 className="flex gap-4 w-full">Re Order Qty <span>{sub.partNumber.reorder_qty}</span></h1>
                </div>
            </CustomModal>
        </>
    )
}