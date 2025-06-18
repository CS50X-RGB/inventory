'use client';
import { getData, putData } from "@/core/api/apiHandler";
import { rolesRoutes } from "@/core/api/apiRoutes";
import {
    Table, TableBody, TableRow, TableColumn, TableCell, TableHeader, Spinner,
    Button
} from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Checkbox } from "@heroui/react";
import { useEffect, useState } from "react";
import { queryClient } from "@/app/providers";


export default function PermissionPage() {
    const { data: getRoles, isFetching: isFetchingRoles, isSuccess: isRolesSuccess } = useQuery({
        queryKey: ["getRoles"],
        queryFn: () => getData(rolesRoutes.getAll, {})
    });

    const { data: getPermission, isFetching: isFetchingPermission, isSuccess: isPermissionsSuccess } = useQuery({
        queryKey: ["getPermission"],
        queryFn: () => getData(rolesRoutes.getPermission, {})
    });

    const updatePermissions = useMutation({
        mutationKey: ["updatePersmission"],
        mutationFn: () => putData(rolesRoutes.update, {}, {
            roles: backendRoleMap
        }),
        onSuccess: (data: any) => {
            console.log(data, "data");
            queryClient.invalidateQueries();
        }
    });
    const roles = getRoles?.data?.data || [];
    const permissions = getPermission?.data?.data || [];


    const [rolesMap, setRolesMap] = useState<Record<string, string[]>>({});
    const [backendRoleMap, setBackendRoleMap] = useState<Record<string, string[]>>({});
    const [initialized, setInitialized] = useState(false);
    const [isMount, setisMount] = useState(false);
    useEffect(() => {
        if (!initialized && isRolesSuccess && isPermissionsSuccess && roles.length > 0) {
            const initialMap: Record<string, string[]> = {};
            roles.forEach((role: any) => {
                initialMap[role._id] = role.permissions || [];
            });
            setRolesMap(initialMap);
            setInitialized(true);
        }
    }, [isRolesSuccess, isPermissionsSuccess, roles, initialized]);
    console.log(backendRoleMap,"backendmap");
    const handleCheckboxToggle = (roleId: string, permissionId: string) => {
        // Update backendRoleMap
       console.log(permissionId,"Perimission");
        setBackendRoleMap((prevMap) => {
            const currentPermissions = prevMap[roleId] ?? [];
            const isChecked = currentPermissions.includes(permissionId);
            const updatedPermissions = isChecked ? currentPermissions.filter(id => id != permissionId) :  [...currentPermissions, permissionId];


            return {
                ...prevMap,
                [roleId]: updatedPermissions
            };
        });
        setRolesMap((prevMap) => {
            const currentPermissions = prevMap[roleId] ?? [];
            const isChecked = currentPermissions.includes(permissionId);
            const updated = isChecked
                ? currentPermissions.filter(id => id !== permissionId)
                : [...currentPermissions, permissionId];

            return {
                ...prevMap,
                [roleId]: updated
            };
        });
    };

    useEffect(() => {
        if (Object.keys(rolesMap).length > 0) {
            setisMount(true);
            console.log(rolesMap);
        }
    }, [rolesMap,isMount]);


    const isPermissionChecked = (roleId: string, permissionId: string) => {
        console.log(roleId,permissionId,rolesMap);
        const rolePermissions = rolesMap[roleId] ?? [];
        return rolePermissions.includes(permissionId);
    };
    if (isMount) {

        return (
            <>
                <Table key={JSON.stringify(rolesMap)} aria-label="Permission Table">
                    <TableHeader>
                        <TableColumn key="page">Page Name</TableColumn>
                        {roles.map((role: any) => (
                            <TableColumn key={role._id}>{role.name}</TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody
                        key={JSON.stringify(rolesMap)}
                        items={permissions}
                        loadingContent={<Spinner />}
                        loadingState={
                            isFetchingPermission && isFetchingRoles
                                ? "loading"
                                : "idle"
                        }
                    >
                        {(permission: any) => (
                            <TableRow key={permission._id}>
                                {(columnKey) => {
                                    if (columnKey === "page") {
                                        return <TableCell>{permission.name}</TableCell>;
                                    }

                                    const roleId = String(columnKey);
                                    const isChecked = isPermissionChecked(roleId, permission._id);
                                    return (
                                        <TableCell>
                                            <Checkbox
                                                key={`${roleId}-${permission._id}-${isChecked}`} 
                                                isSelected={rolesMap[roleId]?.includes(permission._id)}
                                                onChange={() => handleCheckboxToggle(roleId, permission._id)}
                                            />
                                        </TableCell>
                                    );
                                }}
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
                <div className="flex flex-row w-full items-center justify-end p-5">
                    {Object.keys(backendRoleMap).length > 0 && (
                        <Button color="primary"  onPress={() => updatePermissions.mutate()}>Update</Button>
                    )}
                </div>
            </>
        );
    } else {
        return <Spinner />;
    }
}
