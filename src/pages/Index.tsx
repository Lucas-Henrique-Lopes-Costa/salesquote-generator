import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Send, Loader2 } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import ProductsTable from "@/components/ProductsTable";
import { OrderFormData, Product } from "@/types/order";
import { generateOrderPdf } from "@/utils/generatePdf";
import biomfarmLogo from "@/assets/biomfarm-logo.png";

const initialFormData: OrderFormData = {
  vendedor: "",
  codigo: "",
  ordemCompra: "",
  data: new Date().toISOString().split("T")[0],
  razaoSocial: "",
  pessoa: "juridica",
  cnpjCpf: "",
  ieRg: "",
  contato: "",
  fone: "",
  email: "",
  enderecoFaturamento: "",
  cepFaturamento: "",
  cidadeFaturamento: "",
  bairroFaturamento: "",
  ufFaturamento: "",
  enderecoCobranca: "",
  cepCobranca: "",
  cidadeCobranca: "",
  bairroCobranca: "",
  ufCobranca: "",
  produtos: [],
  condicaoPagamento: "avista",
  moeda: "real",
  vencimento: "",
  trocaTipo: "soja",
  trocaValor: "",
  armazemCidade: "",
  armazemUf: "",
  ciclo: "safra",
  frete: "cif",
  dadosBancarios: "",
  observacoes: "",
};

const Index = () => {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const update = (field: keyof OrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadPdf = () => {
    if (!formData.vendedor || !formData.codigo) {
      toast({ title: "Preencha o vendedor e o código", variant: "destructive" });
      return;
    }
    const doc = generateOrderPdf(formData);
    doc.save(`Orcamento_${formData.vendedor}_${formData.codigo}.pdf`);
    toast({ title: "PDF gerado com sucesso!" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendedor || !formData.codigo) {
      toast({ title: "Preencha o vendedor e o código", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const doc = generateOrderPdf(formData);
      const pdfBlob = doc.output("blob");
      const pdfBase64 = await blobToBase64(pdfBlob);

      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendedor: formData.vendedor,
          codigo: formData.codigo,
          pdfBase64,
          fileName: `Orcamento_${formData.vendedor}_${formData.codigo}.pdf`,
        }),
      });

      if (!response.ok) throw new Error("Erro ao enviar");

      toast({ title: "Pedido enviado com sucesso!", description: "O PDF foi enviado para financeiro@biomfarm.com.br" });

      // Also download
      doc.save(`Orcamento_${formData.vendedor}_${formData.codigo}.pdf`);
    } catch {
      // If edge function not available, just download
      const doc = generateOrderPdf(formData);
      doc.save(`Orcamento_${formData.vendedor}_${formData.codigo}.pdf`);
      toast({
        title: "PDF baixado com sucesso!",
        description: "O envio automático por e-mail requer configuração do backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="bg-primary p-6 flex items-center gap-5">
            <img src={biomfarmLogo} alt="Biomfarm" className="h-16 rounded-lg bg-primary-foreground p-2 object-contain" />
            <div className="text-primary-foreground">
              <h1 className="text-xl font-bold tracking-wide">Pedido de Venda</h1>
              <p className="text-xs opacity-70 mt-1">CNPJ: 55.390.062/0001-49 | comercial@biomfarm.com.br</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Vendedor & Codigo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-accent/50 rounded-lg border border-accent">
              <div>
                <Label>Vendedor *</Label>
                <Input value={formData.vendedor} onChange={(e) => update("vendedor", e.target.value)} placeholder="Nome do vendedor" required />
              </div>
              <div>
                <Label>Código *</Label>
                <Input value={formData.codigo} onChange={(e) => update("codigo", e.target.value)} placeholder="Código do pedido" required />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={formData.data} onChange={(e) => update("data", e.target.value)} />
              </div>
            </div>

            {/* Ordem */}
            <div>
              <Label>Ordem de Compra</Label>
              <Input value={formData.ordemCompra} onChange={(e) => update("ordemCompra", e.target.value)} placeholder="Nº da ordem" />
            </div>

            {/* Client */}
            <SectionTitle>Dados do Cliente</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Razão Social</Label>
                <Input value={formData.razaoSocial} onChange={(e) => update("razaoSocial", e.target.value)} />
              </div>
              <div>
                <Label>Tipo de Pessoa</Label>
                <RadioGroup value={formData.pessoa} onValueChange={(v) => update("pessoa", v)} className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="fisica" id="pf" />
                    <Label htmlFor="pf" className="font-normal">Física</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="juridica" id="pj" />
                    <Label htmlFor="pj" className="font-normal">Jurídica</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>{formData.pessoa === "fisica" ? "CPF" : "CNPJ"}</Label>
                <Input value={formData.cnpjCpf} onChange={(e) => update("cnpjCpf", e.target.value)} />
              </div>
              <div>
                <Label>{formData.pessoa === "fisica" ? "RG" : "Inscrição Estadual"}</Label>
                <Input value={formData.ieRg} onChange={(e) => update("ieRg", e.target.value)} />
              </div>
              <div>
                <Label>Contato</Label>
                <Input value={formData.contato} onChange={(e) => update("contato", e.target.value)} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={formData.fone} onChange={(e) => update("fone", e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} />
              </div>
            </div>

            {/* Address */}
            <SectionTitle>Endereço de Faturamento</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Label>Endereço</Label>
                <Input value={formData.enderecoFaturamento} onChange={(e) => update("enderecoFaturamento", e.target.value)} />
              </div>
              <div>
                <Label>CEP</Label>
                <Input value={formData.cepFaturamento} onChange={(e) => update("cepFaturamento", e.target.value)} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={formData.cidadeFaturamento} onChange={(e) => update("cidadeFaturamento", e.target.value)} />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input value={formData.bairroFaturamento} onChange={(e) => update("bairroFaturamento", e.target.value)} />
              </div>
              <div className="w-20">
                <Label>UF</Label>
                <Input value={formData.ufFaturamento} onChange={(e) => update("ufFaturamento", e.target.value)} maxLength={2} />
              </div>
            </div>

            <SectionTitle>Endereço de Cobrança</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Label>Endereço</Label>
                <Input value={formData.enderecoCobranca} onChange={(e) => update("enderecoCobranca", e.target.value)} />
              </div>
              <div>
                <Label>CEP</Label>
                <Input value={formData.cepCobranca} onChange={(e) => update("cepCobranca", e.target.value)} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={formData.cidadeCobranca} onChange={(e) => update("cidadeCobranca", e.target.value)} />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input value={formData.bairroCobranca} onChange={(e) => update("bairroCobranca", e.target.value)} />
              </div>
              <div className="w-20">
                <Label>UF</Label>
                <Input value={formData.ufCobranca} onChange={(e) => update("ufCobranca", e.target.value)} maxLength={2} />
              </div>
            </div>

            {/* Products */}
            <SectionTitle>Discriminação do Produto</SectionTitle>
            <ProductsTable products={formData.produtos} onChange={(p) => update("produtos", p)} />

            {/* Payment */}
            <SectionTitle>Condições de Pagamento</SectionTitle>
            <div className="space-y-4">
              <RadioGroup value={formData.condicaoPagamento} onValueChange={(v) => update("condicaoPagamento", v)} className="flex flex-wrap gap-4">
                {[
                  { value: "avista", label: "À Vista" },
                  { value: "aprazo", label: "À Prazo" },
                  { value: "bonificacao", label: "Bonificação" },
                  { value: "troca", label: "Troca" },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`pag-${opt.value}`} />
                    <Label htmlFor={`pag-${opt.value}`} className="font-normal">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>

              {formData.condicaoPagamento === "aprazo" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Moeda</Label>
                    <RadioGroup value={formData.moeda} onValueChange={(v) => update("moeda", v)} className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="real" id="real" />
                        <Label htmlFor="real" className="font-normal">Real (R$)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="dolar" id="dolar" />
                        <Label htmlFor="dolar" className="font-normal">Dólar (US$)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Vencimento</Label>
                    <Input value={formData.vencimento} onChange={(e) => update("vencimento", e.target.value)} placeholder="DD/MM/AAAA" />
                  </div>
                </div>
              )}

              {formData.condicaoPagamento === "troca" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Tipo de Troca</Label>
                    <RadioGroup value={formData.trocaTipo} onValueChange={(v) => update("trocaTipo", v)} className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="soja" id="soja" />
                        <Label htmlFor="soja" className="font-normal">Soja em Grãos (SJ$)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="milho" id="milho" />
                        <Label htmlFor="milho" className="font-normal">Milho em Grãos (ML$)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="semente" id="semente" />
                        <Label htmlFor="semente" className="font-normal">Semente de Soja (SM$)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input value={formData.trocaValor} onChange={(e) => update("trocaValor", e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <Label>Dados Bancários</Label>
                <Input value={formData.dadosBancarios} onChange={(e) => update("dadosBancarios", e.target.value)} placeholder="Banco, agência, conta..." />
              </div>
            </div>

            {/* Delivery */}
            <SectionTitle>Entrega</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Armazém - Cidade</Label>
                <Input value={formData.armazemCidade} onChange={(e) => update("armazemCidade", e.target.value)} />
              </div>
              <div className="w-20">
                <Label>UF</Label>
                <Input value={formData.armazemUf} onChange={(e) => update("armazemUf", e.target.value)} maxLength={2} />
              </div>
              <div>
                <Label>Ciclo</Label>
                <RadioGroup value={formData.ciclo} onValueChange={(v) => update("ciclo", v)} className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="safra" id="safra" />
                    <Label htmlFor="safra" className="font-normal">Safra</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="safrinha" id="safrinha" />
                    <Label htmlFor="safrinha" className="font-normal">Safrinha</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>Frete</Label>
                <RadioGroup value={formData.frete} onValueChange={(v) => update("frete", v)} className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cif" id="cif" />
                    <Label htmlFor="cif" className="font-normal">CIF</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="fob" id="fob" />
                    <Label htmlFor="fob" className="font-normal">FOB</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Obs */}
            <div>
              <Label>Observações</Label>
              <Textarea value={formData.observacoes} onChange={(e) => update("observacoes", e.target.value)} rows={3} />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={handleDownloadPdf} className="gap-2 flex-1">
                <FileDown size={18} />
                Baixar PDF
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 flex-1">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Gerar PDF e Enviar por E-mail
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Pedido válido somente após aprovação do Depto. Crédito/Comercial.
        </p>
      </form>
    </div>
  );
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default Index;
