const fs = require("fs");

const path = "components/admin/inventory/InventoryManager.tsx";
let txt = fs.readFileSync(path, "utf8");

const start = txt.indexOf("function Editorial(props: any)");
const end = txt.indexOf("function Preview");

if (start === -1 || end === -1) {
  throw new Error("No se encontró Editorial o Preview");
}

const replacement = `
function Editorial(props: any) {
  async function uploadBlockImage(file?: File) {
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload-vehicle-image", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();

    if (!res.ok || !json.url) {
      alert(json.message || "No se pudo subir la imagen.");
      return;
    }

    props.onImage(json.url);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
      <h3 className="text-lg font-black">{props.title}</h3>

      <div className="mt-4 grid gap-4">
        <Input
          label="Título"
          value={props.titleValue}
          onChange={props.onTitle}
        />

        <Textarea
          label="Texto"
          value={props.textValue}
          onChange={props.onText}
        />

        <div className="grid gap-2">
          <span className="text-sm font-bold">{props.imageLabel}</span>

          <div className="flex flex-wrap gap-3">
            <input
              value={props.img || ""}
              onChange={(e) => props.onImage(e.target.value)}
              placeholder="URL de imagen"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
            />

            <label className="cursor-pointer rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black">
              Subir imagen

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadBlockImage(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        {props.img ? (
          <img
            src={props.img}
            className="h-56 w-full rounded-2xl object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}

function Preview
`;

txt =
  txt.slice(0, start) +
  replacement +
  txt.slice(end + "function Preview".length);

fs.writeFileSync(path, txt);

console.log("OK");
