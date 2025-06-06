import { Card, CardBody, Skeleton } from "@heroui/react";

export default function BomLoadingCardSkeleton() {
    return (
        <Card className="w-2/3 animate-pulse">
            <CardBody className="flex flex-row w-full justify-between p-3">
                <div className="flex flex-row">
                    <Skeleton className="w-120 h-32 rounded-xl" />

                    <div className="flex flex-col gap-4 p-4">
                        <Skeleton className="h-6 w-40 rounded" />
                        <Skeleton className="h-4 w-64 rounded" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded" />
                            <Skeleton className="h-6 w-16 rounded" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <Skeleton className="h-8 w-24 rounded" />
                </div>
            </CardBody>
        </Card>
    );
}
