"use client";
import { Button, Card, CardBody, Input, Autocomplete, AutocompleteItem, CardHeader } from '@heroui/react';
import React, { useState } from 'react';
import { useAsyncList } from "@react-stately/data";
import { localBackend } from '@/core/api/axiosInstance';
import { useRouter } from 'next/navigation';
import { accountRoutes } from '@/core/api/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { postData } from '@/core/api/apiHandler';
import { toast } from 'sonner';

export default function CreateFom() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        role : ''
    });
    const [loadingUser,setloadingUser] = useState<boolean>(false);
    const createUser = useMutation({
        mutationKey : ["create-user"],
        mutationFn : async (userData : any) => {
            return await postData(accountRoutes.signin,{},userData);
        },
        onSuccess : (data : any) => {
            console.log(data.data.data);
            toast.success('User Created',{
                position : "top-right",
                className : "bg-green-500 text-white"
            });
            router.push("/admin");
            setloadingUser(false);
        },
        onError : (error : any) => {
            console.error(error);
            toast.error("User Creation failed",{
                position : "top-right"
            });
            setloadingUser(false);
        }
    })
    const router = useRouter();
    const handleChange = (type: keyof typeof user, value: string) => {
        setUser(prev => ({
            ...prev,
            [type]: value,
        }));
    };
    let list = useAsyncList({
        async load({ filterText }) {
            let res = await fetch(`${localBackend}role/all/roles/?search=${filterText}`, {});
            console.log(res, "RES");
            let json = await res.json();
            console.log(json, "JSON");
            return {
                items: json.data,
            };
        },
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setloadingUser(true);
        createUser.mutate(user);
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <Card className="w-full max-w-md">
                <CardHeader className='text-xl w-full font-bold text-user'>Create User</CardHeader>
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
                            isRequired
                            placeholder="Write Password"
                            value={user.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                        />
                        <Autocomplete
                            className="max-w-xl"
                            inputValue={list.filterText}
                            isLoading={list.isLoading}
                            items={list.items}
                            isRequired={true}
                            onSelectionChange={(e) => handleChange("role",e)}
                            label="Select Role"
                            variant="bordered"
                            onInputChange={list.setFilterText}
                        >
                            {(item : any) => (
                                <AutocompleteItem key={item._id} className="capitalize">
                                    {item.name}
                                </AutocompleteItem>
                            )}
                        </Autocomplete>
                        <Button isLoading={loadingUser} type="submit" color="primary">Submit</Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}

