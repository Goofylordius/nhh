import { jsonCreated, jsonError, jsonOk, parseJsonBody } from "@/lib/http";
import {
  assertResourceKey,
  createResource,
  getActorLabel,
  listResource,
} from "@/lib/crm-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const { entity } = await params;
    const resource = assertResourceKey(entity);
    const data = await listResource(resource);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error, 404);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const { entity } = await params;
    const resource = assertResourceKey(entity);
    const actorLabel = getActorLabel(request);
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const data = await createResource(resource, body, actorLabel);
    return jsonCreated(data);
  } catch (error) {
    return jsonError(error, 400);
  }
}

