const fs = require("fs");
const p = "app/api/vehicles/route.ts";
let txt = fs.readFileSync(p, "utf8");

txt = txt.replace(/const id = Number\(body\.id\);/g, "const id = body.id;");
txt = txt.replace(/const id = Number\(new URL\(req\.url\)\.searchParams\.get\("id"\)\);/g, 'const id = new URL(req.url).searchParams.get("id");');

txt = txt.replace(
/const \{ data, error \} = await supabaseAdmin\s*\n\s*\.from\("vehicles"\)\s*\n\s*\.update\(payload\)\s*\n\s*\.eq\("id", id\)\s*\n\s*\.select\("\*"\)\s*\n\s*\.single\(\);[\s\S]*?return NextResponse\.json\(\{ ok: true, vehicle: data \}\);/,
`const { error } = await supabaseAdmin
    .from("vehicles")
    .update(payload)
    .eq("id", id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });`
);

fs.writeFileSync(p, txt);
