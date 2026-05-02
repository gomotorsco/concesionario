import InventoryManager from "@/components/admin/inventory/InventoryManager";

export default function CiclomotoresAdminPage() {
  return (
    <InventoryManager
      type="ciclomotor"
      title="Ciclomotores / Cuatriciclos"
      description="Gestione marcas, modelos, versiones, imagen hero, galería, precio y descripción de movilidad ligera o recreativa."
      examples="Ej: Auteco, AKT, Starker, marcas recreativas"
    />
  );
}
