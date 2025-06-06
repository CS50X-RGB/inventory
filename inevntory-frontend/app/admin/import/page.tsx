'use client';
import { Input, Button } from "@heroui/react";
import React, { useState } from "react";
import * as XSLX from "xlsx";
import ShowTableData from "@/components/ShowTableData";
import { useMutation } from "@tanstack/react-query";
import { postData } from "@/core/api/apiHandler";
import { partNumbersRoutes } from "@/core/api/apiRoutes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Import() {
    const [file, setFile] = useState<File | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const pageSize = 10;
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);

        const reader = new FileReader();
        reader.onload = (evt: any) => {
            const data = evt.target?.result;
            const workbook = XSLX.read(data, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawJson = XSLX.utils.sheet_to_json(sheet);

            // Normalize keys
            const normalizedData = rawJson.map((row: any) => ({
                name: row["Name"],
                description: row["Description"],
                in_stock_qty: row["In Stock Quantity"],
                re_order_level: row["Re Order Level"]
            }));

            console.log(normalizedData);
            setTableData(normalizedData);
        };
        reader.readAsBinaryString(file);
    };
    const partNumberImport = useMutation({
        mutationKey: ["partNumberImport"],
        mutationFn: async (data: FormData) => {
            return postData(partNumbersRoutes.partImport, {}, data);
        },
        onSuccess: (data: any) => {
            toast.success(data.data.message, {
                position: "top-right",
            });
            router.push("/admin/view");
        }
    });
    const handlePartImport = () => {
        if (!file) {
            toast.error("No file selected");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        partNumberImport.mutate(formData);
    }
    const [page, setPage] = useState<number>(1);
    const pages = Math.ceil(tableData.length / pageSize);
    const paginatedData = tableData.slice((page - 1) * pageSize, page * pageSize);
    const columnHeaders = [
        { name: "Name" },
        { name: "Description" },
        { name: "In_Stock_Qty" },
        { name: "Re_Order_Level" }
    ];

    return (
        <div className="flex flex-col p-4 gap-4 w-full">
            <h1 className="text-xl font-bold">Import Assembly Part Numbers</h1>
            <Input
                type="file"
                className="w-1/4 p-4 cursor-pointer"
                accept=".xlsx"
                placeholder="Put the Part Number file here" onChange={handleFileChange} />
            {paginatedData.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h1 className="text-">Details of the Imported Parts</h1>
                    <ShowTableData data={paginatedData} page={page} setPage={setPage} pages={pages} columnHeaders={columnHeaders} />
                    <div className="flex justify-end w-full">
                        <Button onPress={() => handlePartImport()} size="md" color="primary" className="p-3">Upload</Button>
                    </div>
                </div>
            )}

        </div>
    )
}
