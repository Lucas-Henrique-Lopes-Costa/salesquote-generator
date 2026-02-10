import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/order";

interface ProductsTableProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

const ProductsTable = ({ products, onChange }: ProductsTableProps) => {
  const addProduct = () => {
    onChange([
      ...products,
      {
        id: crypto.randomUUID(),
        descricao: "",
        unidade: "",
        volume: "",
        precoUnitario: 0,
        total: 0,
      },
    ]);
  };

  const removeProduct = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: string | number) => {
    onChange(
      products.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        if (field === "volume" || field === "precoUnitario") {
          const vol = field === "volume" ? parseFloat(value as string) || 0 : parseFloat(p.volume) || 0;
          const price = field === "precoUnitario" ? (value as number) : p.precoUnitario;
          updated.total = vol * price;
        }
        return updated;
      })
    );
  };

  const totalGeral = products.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/5">
              <th className="text-left p-3 font-medium text-foreground">Descrição do Produto</th>
              <th className="text-left p-3 font-medium text-foreground w-24">Unid.</th>
              <th className="text-left p-3 font-medium text-foreground w-24">Volume</th>
              <th className="text-left p-3 font-medium text-foreground w-32">Preço Un.</th>
              <th className="text-right p-3 font-medium text-foreground w-32">Total</th>
              <th className="w-12 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-2">
                  <Input
                    value={product.descricao}
                    onChange={(e) => updateProduct(product.id, "descricao", e.target.value)}
                    placeholder="Nome do produto"
                    className="border-0 bg-transparent shadow-none focus-visible:ring-1 h-9"
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={product.unidade}
                    onChange={(e) => updateProduct(product.id, "unidade", e.target.value)}
                    placeholder="L, Kg..."
                    className="border-0 bg-transparent shadow-none focus-visible:ring-1 h-9"
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={product.volume}
                    onChange={(e) => updateProduct(product.id, "volume", e.target.value)}
                    placeholder="0"
                    className="border-0 bg-transparent shadow-none focus-visible:ring-1 h-9"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={product.precoUnitario || ""}
                    onChange={(e) => updateProduct(product.id, "precoUnitario", parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="border-0 bg-transparent shadow-none focus-visible:ring-1 h-9"
                  />
                </td>
                <td className="p-2 text-right font-medium text-foreground pr-4">
                  R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Nenhum produto adicionado
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-primary/20 bg-primary/5">
              <td colSpan={4} className="p-3 text-right font-semibold text-foreground">
                VALOR TOTAL DO PEDIDO:
              </td>
              <td className="p-3 text-right font-bold text-primary text-lg">
                R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addProduct} className="gap-2">
        <Plus size={16} />
        Adicionar Produto
      </Button>
    </div>
  );
};

export default ProductsTable;
