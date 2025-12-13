import { z } from "zod";
import { EdgeSchema, type Edge } from "@/shared/entities/edge";

export const EdgeDtoSchema = EdgeSchema.extend({
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
}).strict();
export type EdgeDto = z.output<typeof EdgeDtoSchema>;

export function toEdgeDto(edge: Edge): EdgeDto {
    return EdgeDtoSchema.parse({
        ...edge,
        createdAt: edge.createdAt.toISOString(),
        updatedAt: edge.updatedAt.toISOString(),
    });
}

export function fromEdgeDto(dto: EdgeDto): Edge {
    return EdgeSchema.parse({
        ...dto,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    });
}
