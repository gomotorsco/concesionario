import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type EventPayload = {
  type: string;
  origin?: string | null;
  vehicle_id?: number | null;
  vehicle_name?: string | null;
  meta?: any;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EventPayload;

    if (!body?.type || typeof body.type !== "string") {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("events").insert({
      type: body.type,
      origin: body.origin ?? null,
      vehicle_id: body.vehicle_id ?? null,
      vehicle_name: body.vehicle_name ?? null,
      meta: body.meta ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
