'use client';
import { useState } from "react"
import { useMutation } from "@tanstack/react-query";
import { postData } from "@/core/api/apiHandler";
import { Input } from "@heroui/input";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { bomRoutes } from "@/core/api/apiRoutes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateBom() {
    const [state, setVal] = useState<any>({
        name: "",
        description: ""
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const createBOM = useMutation({
        mutationKey: ["createBom"],
        mutationFn: async () => {
            return postData(bomRoutes.createBom, {}, state);
        },
        onMutate: () => {
            setIsLoading(true);
        },
        onSettled: () => {
            setIsLoading(false);
            toast.success("Top Level is Created", {
                position: "top-right"
            });
            router.push("/admin/bom/view");
        },
        onSuccess: (data) => {
            console.log(data.data);
        },
        onError: (err) => {
        }
    });

    const handleValue = (type: string, value: string) => {
        setVal((prev: any) => ({
            ...prev,
            [type]: value
        }));
    };

    return (
        <div className="flex flex-col justify-center items-center h-[80vh] w-full">
            <Card className="w-1/3 font-bold font-mono flex flex-col items-center justify-center">
                <CardHeader className="text-2xl">Create Top Level Assembly</CardHeader>
                <CardBody className="flex flex-col w-full gap-4">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        createBOM.mutate();
                    }} className="flex flex-col gap-4 p-5">
                        <Input type="text" onValueChange={(e) => handleValue("name", e)} placeholder="Top Level Name" />
                        <Input type="text" onValueChange={(e) => handleValue("description", e)} placeholder="Top Level Description" />
                        <Button type="submit" color="primary" isLoading={isLoading} >Submit</Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    )
}