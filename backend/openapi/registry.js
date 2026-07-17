import {OpenAPIRegistry,extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import {z} from "zod";

extendZodWithOpenApi(z);

//collects schemas and routes before making documentation
export const registry = new OpenAPIRegistry();
