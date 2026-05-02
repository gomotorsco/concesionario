import InventoryManager from "@/components/admin/inventory/InventoryManager";

export default function MotosAdminPage() {
  return (
    <InventoryManager
      type="moto"
      title="Motos"
      description="Gestione marcas de motos, modelos, versiones, cilindrada, imagen hero, galería, precio y ficha comercial."
      examples="Ej: Yamaha, Honda, Suzuki, Bajaj, AKT"
    />
  );
}
