import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const TABLE = "config";
const KEY_COLUMN = "key";
const VALUE_COLUMN = "value";
const KEY = "whatsapp_number";

export async function getWhatsappNumber(): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select(`${VALUE_COLUMN}`)
    .eq(KEY_COLUMN, KEY)
    .maybeSingle();

  if (error) {
    console.error("getWhatsappNumber error:", error.message);
    return null;
  }

  return data?.[VALUE_COLUMN] ?? null;
}
