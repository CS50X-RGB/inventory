'use client';
import { Card, CardBody, Image, Chip } from "@heroui/react";
import { useRouter} from "next/navigation";

export default function PressableCard({ bid }: any) {
    const router = useRouter();
    return (
        <Card onPress={() => router.push(`/seller/inprogress/${bid._id}`)} isPressable={true} className="w-2/3">
            <CardBody className="flex flex-row w-full justify-between p-3">
                <div className="flex flex-row">
                    {bid.images && bid.images.length > 0 && (
                        <Image src={bid.images[0]} alt="image" className="w-120 h-40 rounded-xl shadow-xl" />
                    )}
                    <div className="flex flex-col gap-4 p-4">
                        <h1 className="font-bold text-xl">{bid.name}</h1>
                        <p>{bid.description}</p>
                        {bid.category.map((c: any, index: number) => {
                            return <Chip key={index} color="primary">{c.name}</Chip>
                        })}
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold text-3xl">Rs {bid.maxtotalPrice}</h1>
                </div>
            </CardBody>
        </Card>
    );
}
