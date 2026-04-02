import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    status: 200,
    ...(init ?? {}),
  });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, {
    status: 201,
  });
}

export function jsonError(error: unknown, fallbackStatus = 500) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Validierungsfehler",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        message: error.message || "Unerwarteter Fehler",
      },
      { status: fallbackStatus },
    );
  }

  return NextResponse.json(
    {
      message: "Unerwarteter Fehler",
    },
    { status: fallbackStatus },
  );
}

export async function parseJsonBody<T>(request: Request) {
  const body = (await request.json()) as T;
  return body;
}

