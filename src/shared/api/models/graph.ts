import { z } from "zod";
import { GraphSchema, type Graph } from "@/shared/entities/graph";

export const GraphDtoSchema = GraphSchema.extend({
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
}).strict();
export type GraphDto = z.output<typeof GraphDtoSchema>;

export function toGraphDto(graph: Graph): GraphDto {
    return GraphDtoSchema.parse({
        ...graph,
        createdAt: graph.createdAt.toISOString(),
        updatedAt: graph.updatedAt.toISOString(),
    });
}

export function fromGraphDto(dto: GraphDto): Graph {
    return GraphSchema.parse({
        ...dto,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    });
}
