import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderFormData } from "@/types/order";

export function generateOrderPdf(data: OrderFormData): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // Header
  doc.setFillColor(30, 100, 60);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BIOMFARM", margin, y + 5);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("BIOTECNOLOGIA E BIONUTRIÇÃO VEGETAL LTDA", margin, y + 11);
  doc.setFontSize(7);
  doc.text("CNPJ: 55.390.062/0001-49 | IE.: 14.062.740-5", margin, y + 16);
  doc.text("E-mail: comercial@biomfarm.com.br | Fone: (66) 99944-6924 | (11) 99799-3191", margin, y + 21);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PEDIDO DE VENDA", pageWidth - margin, y + 8, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Código: ${data.codigo}`, pageWidth - margin, y + 15, { align: "right" });
  doc.text(`Vendedor: ${data.vendedor}`, pageWidth - margin, y + 21, { align: "right" });

  y = 42;
  doc.setTextColor(0, 0, 0);

  // Helper
  const addLabel = (label: string, value: string, x: number, yPos: number, maxWidth?: number) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(label, x, yPos);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(value || "-", x, yPos + 4, { maxWidth: maxWidth || 80 });
  };

  const addSection = (title: string, yPos: number) => {
    doc.setFillColor(30, 100, 60);
    doc.rect(margin, yPos, pageWidth - margin * 2, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 3, yPos + 4);
    doc.setTextColor(0, 0, 0);
    return yPos + 10;
  };

  // Order info
  addLabel("ORDEM COMPRA", data.ordemCompra, margin, y);
  addLabel("DATA", data.data, 80, y);
  y += 10;

  // Client section
  y = addSection("DADOS DO CLIENTE", y);
  addLabel("RAZÃO SOCIAL", data.razaoSocial, margin, y, 120);
  addLabel("PESSOA", data.pessoa === "fisica" ? "Física" : "Jurídica", 140, y);
  y += 10;
  addLabel("CNPJ / CPF", data.cnpjCpf, margin, y);
  addLabel("INSCRIÇÃO ESTADUAL / RG", data.ieRg, 80, y);
  y += 10;
  addLabel("CONTATO", data.contato, margin, y);
  addLabel("FONE", data.fone, 80, y);
  addLabel("EMAIL", data.email, 130, y);
  y += 12;

  // Address section
  y = addSection("ENDEREÇO", y);
  addLabel("FATURAMENTO", data.enderecoFaturamento, margin, y, 70);
  addLabel("CEP", data.cepFaturamento, 95, y);
  addLabel("CIDADE", data.cidadeFaturamento, 130, y);
  addLabel("UF", data.ufFaturamento, 175, y);
  y += 10;
  addLabel("COBRANÇA", data.enderecoCobranca, margin, y, 70);
  addLabel("CEP", data.cepCobranca, 95, y);
  addLabel("CIDADE", data.cidadeCobranca, 130, y);
  addLabel("UF", data.ufCobranca, 175, y);
  y += 12;

  // Products
  y = addSection("DISCRIMINAÇÃO DO PRODUTO", y);
  
  const tableBody = data.produtos.map((p) => [
    p.descricao,
    p.unidade,
    p.volume,
    `R$ ${p.precoUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    `R$ ${p.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
  ]);

  const totalGeral = data.produtos.reduce((sum, p) => sum + p.total, 0);

  autoTable(doc, {
    startY: y,
    head: [["Descrição", "Unid.", "Volume", "Preço Un.", "Total"]],
    body: tableBody,
    foot: [["", "", "", "TOTAL:", `R$ ${totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 100, 60], textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: [240, 248, 240], textColor: [30, 100, 60], fontStyle: "bold", fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 252, 248] },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Payment section
  if (y > 240) { doc.addPage(); y = 20; }
  y = addSection("CONDIÇÕES DE PAGAMENTO", y);
  
  const pagLabels: Record<string, string> = {
    avista: "À Vista",
    aprazo: "À Prazo",
    bonificacao: "Bonificação",
    troca: "Troca",
  };
  addLabel("CONDIÇÃO", pagLabels[data.condicaoPagamento] || "-", margin, y);
  
  if (data.condicaoPagamento === "aprazo") {
    addLabel("MOEDA", data.moeda === "real" ? "Real (R$)" : "Dólar (US$)", 60, y);
    addLabel("VENCIMENTO", data.vencimento, 110, y);
  }
  if (data.condicaoPagamento === "troca") {
    const trocaLabels: Record<string, string> = { soja: "Soja em Grãos", milho: "Milho em Grãos", semente: "Semente de Soja" };
    addLabel("TIPO TROCA", trocaLabels[data.trocaTipo] || "-", 60, y);
    addLabel("VALOR", data.trocaValor, 120, y);
  }
  addLabel("DADOS BANCÁRIOS", data.dadosBancarios, margin, y + 8, 160);
  y += 20;

  // Delivery
  if (y > 260) { doc.addPage(); y = 20; }
  y = addSection("ENTREGA E OBSERVAÇÕES", y);
  addLabel("ARMAZÉM - CIDADE", data.armazemCidade, margin, y);
  addLabel("UF", data.armazemUf, 80, y);
  addLabel("CICLO", data.ciclo === "safra" ? "Safra" : "Safrinha", 110, y);
  addLabel("FRETE", data.frete === "cif" ? "CIF" : "FOB", 150, y);
  y += 10;
  if (data.observacoes) {
    addLabel("OBSERVAÇÕES", data.observacoes, margin, y, 160);
    y += 15;
  }

  // Footer
  y += 10;
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y + 15, 75, y + 15);
  doc.line(85, y + 15, 140, y + 15);
  doc.line(150, y + 15, pageWidth - margin, y + 15);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("Assinatura do Vendedor", margin + 15, y + 20);
  doc.text("Visto Depto. Crédito", 95, y + 20);
  doc.text("Assinatura do Cliente", 157, y + 20);

  // Bottom note
  doc.setFontSize(6);
  doc.text("PEDIDO VÁLIDO SOMENTE APÓS APROVAÇÃO DO DPTO. CRÉDITO/COMERCIAL.", margin, 285);

  return doc;
}
