export interface AssemblyLineCreate {
    name: string;
    partNumber: string;
    required_qty: number;
    unit_cost: number;
    parent_id: string;
    parent_model: "BOM" | "AssemblyLine";
    level: number;
    uom: string;
}
