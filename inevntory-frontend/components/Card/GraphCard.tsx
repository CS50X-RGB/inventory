import { Card, CardBody } from "@heroui/react";
import { CountCardProps } from "./CountCard";

interface GraphCardProps extends CountCardProps {
    children: React.ReactNode;
}

export default function GraphCard({ children, label, value }: GraphCardProps) {
    const getHeader = (label: string) => {
        switch (label) {
            case "boms":
                return "Total Top Levels";
            default:
                return label;
        }
    };

    return (
        <Card>
            <CardBody className="flex flex-col border border-white items-center shadow-xl shadow-blue-400">
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl font-bold text-center">{getHeader(label)}</h1>
                    <p className="text-2xl font-semibold text-center text-blue-600">{value}</p>
                </div>
                {children}
            </CardBody>
        </Card>
    );
}
