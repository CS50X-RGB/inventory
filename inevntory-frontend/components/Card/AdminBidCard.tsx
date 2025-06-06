import { Card, CardBody, Image, Chip, Button, User, Link, useDisclosure, Input } from "@heroui/react";
import CustomModal from "../Modal/CustomModal";


export default function AdminBidCard({ bid }: any) {
    const { isOpen, onOpen, onOpenChange,onClose } = useDisclosure();
    return (
        <>
            <Card className="w-2/3">
                <CardBody className="flex flex-row w-full justify-between p-3">
                    <div className="flex flex-row items-center">
                        {bid.images && bid.images.length > 0 && (
                            <Image src={bid.images[0]} alt="image" className="w-[200px] h-[100px] rounded-xl shadow-xl" />
                        )}
                        <div className="flex flex-col gap-4 p-4">
                            <h1 className="font-bold text-xl">{bid.name}</h1>
                            <p>{bid.description}</p>
                            {bid.category.map((c: any, index: number) => {
                                return <Chip key={index} color="primary">{c.name}</Chip>
                            })}
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                description={
                                    <Link isExternal href="https://x.com/jrgarciadev" size="sm">
                                        {bid.createdBy.email}
                                    </Link>
                                }
                                name={bid.createdBy.name}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4 justify-center">
                        <h1 className="font-bold text-3xl">Rs {bid.maxtotalPrice}</h1>
                        <Button color="danger" className="rounded-xl" onPress={() => onOpen()}>Delete Bid</Button>
                    </div>
                </CardBody>
            </Card>
            <CustomModal heading="Delete Bid" isOpen={isOpen} onOpenChange={onOpenChange} bottomContent={
                <div className="flex flex-row gap-2">
                    <Button onPress={onClose}>Close</Button>
                    <Button color="danger">Submit</Button>
                </div>
            }>
                <h2>Are You Sure You Want to Delete This Bid ?</h2>
            </CustomModal>
        </>
    );
}