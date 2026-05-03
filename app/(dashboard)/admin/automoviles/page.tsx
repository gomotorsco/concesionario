import InventoryManager from "@/components/admin/inventory/InventoryManager";

export default function AutomovilesAdminPage() {
  return (
    <InventoryManager
      type="auto"
      title="Automóviles"
      description="Gestione marcas de automóviles, modelos, versiones, imagen hero, galería, precio, descripción y visibilidad."
      examples="Ej: Chevrolet, Renault, Toyota, Hyundai"
    />
  );
}
