import { jsonError, jsonOk } from "@/lib/http";
import {
  assertResourceKey,
  deleteResource,
  getActorLabel,
  updateResource,
} from "@/lib/crm-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  try {
    const { entity, id } = await params;
    const resource = assertResourceKey(entity);
    const actorLabel = getActorLabel(request);
    const body = (await request.json()) as Record<string, unknown>;
    const data = await updateResource(resource, id, body, actorLabel);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error, 400);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  try {
    const { entity, id } = await params;
    const resource = assertResourceKey(entity);
    const actorLabel = getActorLabel(request);
    const data = await deleteResource(resource, id, actorLabel);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error, 400);
  }
}

