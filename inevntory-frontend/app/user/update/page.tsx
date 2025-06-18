'use client';
import { getData, putData } from "@/core/api/apiHandler";
import { accountRoutes } from "@/core/api/apiRoutes";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UpdateUser() {
    const [user, setUser] = useState({
        name: "",
        password: "",
        role: "",
        email: ""
    });
    const [loadingUser, setloadingUser] = useState<boolean>(false);
    const updateUser = useMutation({
        mutationKey: ["updateUserAny"],
        mutationFn: async (item: any) => {
            return await putData(`${accountRoutes.updateUser}${item?._id}`, {}, item);
        },
        onMutate: () => {
            setloadingUser(true);
        },
        onSettled: () => {
            setloadingUser(false);
        },
        onSuccess: (data: any) => {
            setloadingUser(false);
            console.log(data, "data");
            toast.success("User Details update", {
                position: "top-right"
            });
        },
        onError: (err: any) => {
            console.error(err, "Error");
        }
    });
    const { data: getProfile, isFetched, isFetching } = useQuery({
        queryKey: ["getUpdateProfile"],
        queryFn: async () => {
            return await getData(accountRoutes.getMineProfile, {});
        },
    });
    useEffect(() => {
        if (isFetched && getProfile?.data) {
            const { password, ...sanitizedItem } = getProfile?.data?.data;
            setUser(sanitizedItem);
        }
    }, [isFetched, getProfile]);
    const handleChange = (type: any, value: string) => {
        setUser((prev: any) => ({
            ...prev,
            [type]: value,
        }));
    };
    const handleSubmit = (e: any) => {
        setloadingUser(true);
        updateUser.mutate(user);
    }
    return (
       <div className="w-full h-[70vh] flex flex-col items-center justify-center"> 
        <Card className="w-full max-w-md">
            <CardHeader className='text-xl w-full font-bold text-user'>Update User</CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Name"
                        type="text"
                        isRequired
                        placeholder="Write Name"
                        value={user.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                    <Input
                        label="Email"
                        type="email"
                        isRequired
                        placeholder="Write Email"
                        value={user.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Write Password"
                        value={user.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                    />
                    <Button isLoading={loadingUser} type="submit" color="primary">Submit</Button>
                </form>
            </CardBody>
        </Card>
        </div>
    )
}
