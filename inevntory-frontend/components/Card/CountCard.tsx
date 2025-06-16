import { Card, CardBody } from "@heroui/card";

export interface CountCardProps {
  label: string;
  value: number;
};

export default function CountCard({ label, value }: CountCardProps) {
  const getHeader = (label: string) => {
    switch (label) {
      case "boms":
        return "Total Top Levels";
      case "partNumbers":
        return "Total Part Numbers";
      case "locked":
        return "Locked Transactions";
      case "realsed":
        return "Released Transactions";
      case "zero":
        return "Part Number With 0 In Stock";
      default:
        return label;
    }
  };

  return (
    <Card className="w-[200px] h-[200px] flex flex-col items-center justify-center shadow-md shadow-blue-500">
      <CardBody className="flex flex-col items-center p-4 justify-center w-full gap-4">
        <h1 className="text-xl font-bold text-center">{getHeader(label)}</h1>
        <p className="text-2xl font-semibold text-center text-blue-600">{value}</p>
      </CardBody>
    </Card>
  );
}
