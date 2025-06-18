 "use client";
import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react"; 
import Cookies from "js-cookie";

export default function NotFound() {
    const router = useRouter();
    const allowedLinks = JSON.parse(Cookies.get("allowedLinks") || "[]");
    console.log(allowedLinks,"allowed");
    return (
        <Card className="w-full max-w-md mx-auto mt-10 text-center">
            <CardBody>
                <h1 className="text-xl font-semibold mb-4">You are not authorized. Access Denied!</h1>
                <Button 
                    color="primary" 
                    onPress={() => router.push(allowedLinks[0] || "/")}
                >
                    Go Back
                </Button>
            </CardBody>
        </Card>
    );
}
