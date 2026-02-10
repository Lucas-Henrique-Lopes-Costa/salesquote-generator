import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderFormData } from "@/types/order";
import biomfarmLogo from "@/assets/biomfarm-logo.png";

export function generateOrderPdf(data: OrderFormData): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let y = 10;

  // Colors
  const black: [number, number, number] = [0, 0, 0];

  // Helper: Draw rounded rectangle border
  const drawRoundedBorder = (x: number, yPos: number, w: number, h: number, r: number = 4) => {
    doc.setDrawColor(...black);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, yPos, w, h, r, r, "S");
  };

  // Helper: Draw cell with label and value
  const drawCell = (
    x: number,
    yPos: number,
    w: number,
    h: number,
    label: string,
    value: string,
    options?: { labelBold?: boolean; borderRight?: boolean; borderBottom?: boolean }
  ) => {
    const { labelBold = true, borderRight = true, borderBottom = true } = options || {};
    doc.setDrawColor(...black);
    doc.setLineWidth(0.3);

    if (borderRight) doc.line(x + w, yPos, x + w, yPos + h);
    if (borderBottom) doc.line(x, yPos + h, x + w, yPos + h);

    doc.setTextColor(...black);
    doc.setFontSize(8);
    doc.setFont("helvetica", labelBold ? "bold" : "normal");
    const labelText = label ? `${label} ` : "";
    doc.text(labelText, x + 2, yPos + h / 2 + 1);

    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont("helvetica", "normal");
    doc.text(value || "", x + 2 + labelWidth, yPos + h / 2 + 1, { maxWidth: w - labelWidth - 4 });
  };

  // ==================== HEADER ====================
  const headerHeight = 32;
  drawRoundedBorder(margin, y, contentWidth, headerHeight, 4);

  // Left section (logo area) - with divider line
  const leftWidth = 65;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin + leftWidth, y + 5, margin + leftWidth, y + headerHeight - 5);

  // Logo - using image
  try {
    doc.addImage(biomfarmLogo, "PNG", margin + 5, y + 3, 55, 14);
  } catch {
    // Fallback text if image fails
    doc.setTextColor(76, 175, 80);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("BiomFarm", margin + 10, y + 12);
  }

  doc.setTextColor(...black);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("E-mail: comercial@biomfarm.com.br", margin + 5, y + 22);
  doc.text("Fone: (66) 99944-6924 | (11) 99799-3191", margin + 5, y + 27);

  // Right section (company info)
  const rightX = margin + leftWidth + 5;
  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Biomfarm Biotecnologia e Bionutrição Vegetal Ltda", rightX, y + 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("CNPJ: 55.390.062/0001-49 | I.E.: 14.062.740-5", rightX, y + 13);

  // Addresses with pin icon (using bullet)
  doc.setFontSize(7);
  const addresses = [
    "Rua Acir Resende de Souza, Vila Birigui, 404, CEP 78705-025, Rondonópolis-MT",
    "Rodovia BR 163, KM 109, lote n18, lot. aeroporto, 78740-275, Rondonópolis-MT",
    "Av. Ver. João Batista Sanches, 1544 - Distrito Industrial 2, 89065-310 - Maringá-PR",
  ];
  addresses.forEach((addr, i) => {
    doc.text(`• ${addr}`, rightX, y + 18 + i * 4);
  });

  y += headerHeight + 5;

  // ==================== FORM GRID ====================
  const formStartY = y;
  const rowHeight = 8;

  // Calculate form height
  const formHeight = rowHeight * 4 + 16 * 2; // 4 regular rows + 2 address rows (16mm each)
  drawRoundedBorder(margin, y, contentWidth, formHeight, 4);

  // Row 1: PEDIDO DE VENDA | ORDEM COMPRA | DATA
  const row1Y = y;
  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };
  drawCell(margin, row1Y, 70, rowHeight, "PEDIDO DE VENDA:", data.codigo);
  drawCell(margin + 70, row1Y, 80, rowHeight, "ORDEM COMPRA:", data.ordemCompra);
  drawCell(margin + 150, row1Y, contentWidth - 150, rowHeight, "DATA:", formatDate(data.data), { borderRight: false });
  y += rowHeight;

  // Row 2: RAZÃO SOCIAL | PESSOA
  drawCell(margin, y, 140, rowHeight, "RAZÃO SOCIAL:", data.razaoSocial);
  const pessoaValue = `( ${data.pessoa === "fisica" ? "X" : " "} ) Física   ( ${data.pessoa === "juridica" ? "X" : " "} ) Jurídica`;
  drawCell(margin + 140, y, contentWidth - 140, rowHeight, "PESSOA:", pessoaValue, { borderRight: false });
  y += rowHeight;

  // Row 3: CNPJ/CPF | INSCRIÇÃO ESTADUAL/RG
  drawCell(margin, y, 95, rowHeight, "CNPJ / CPF:", data.cnpjCpf);
  drawCell(margin + 95, y, contentWidth - 95, rowHeight, "INSCRIÇÃO ESTADUAL / RG:", data.ieRg, { borderRight: false });
  y += rowHeight;

  // Row 4: CONTATO | Fone | Email
  drawCell(margin, y, 70, rowHeight, "CONTATO:", data.contato);
  drawCell(margin + 70, y, 50, rowHeight, "Fone:", data.fone);
  drawCell(margin + 120, y, contentWidth - 120, rowHeight, "Email:", data.email, { borderRight: false });
  y += rowHeight;

  // Row 5: ENDEREÇO FATURAMENTO (with sidebar)
  const addrHeight = 16;
  const sidebarWidth = 28;
  const addrFieldsX = margin + sidebarWidth;
  const addrFieldsWidth = contentWidth - sidebarWidth;
  const halfHeight = addrHeight / 2;

  // Draw horizontal line at top of address row (separating from previous row)
  doc.setDrawColor(...black);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);

  // Sidebar right border
  doc.line(margin + sidebarWidth, y, margin + sidebarWidth, y + addrHeight);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("ENDEREÇO", margin + 2, y + 6);
  doc.text("FATURAMENTO:", margin + 2, y + 10);

  // Row 1: Endereço | BAIRRO
  doc.line(addrFieldsX, y + halfHeight, margin + contentWidth, y + halfHeight); // horizontal divider
  // Endereço field (large)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (data.enderecoFaturamento) {
    doc.text(data.enderecoFaturamento, addrFieldsX + 2, y + 5);
  }
  // BAIRRO divider and label
  const bairroX = margin + contentWidth - 55;
  doc.line(bairroX, y, bairroX, y + halfHeight);
  doc.setFont("helvetica", "bold");
  doc.text("BAIRRO:", bairroX + 2, y + 5);
  doc.setFont("helvetica", "normal");
  if (data.bairroFaturamento) {
    doc.text(data.bairroFaturamento, bairroX + 20, y + 5);
  }

  // Row 2: CEP | CIDADE | UF
  const row2Y = y + halfHeight;
  // CEP
  doc.setFont("helvetica", "bold");
  doc.text("CEP:", addrFieldsX + 2, row2Y + 5);
  doc.setFont("helvetica", "normal");
  if (data.cepFaturamento) {
    doc.text(data.cepFaturamento, addrFieldsX + 14, row2Y + 5);
  }
  // CIDADE divider
  const cidadeX = addrFieldsX + 40;
  doc.line(cidadeX, row2Y, cidadeX, y + addrHeight);
  doc.setFont("helvetica", "bold");
  doc.text("CIDADE:", cidadeX + 2, row2Y + 5);
  doc.setFont("helvetica", "normal");
  if (data.cidadeFaturamento) {
    doc.text(data.cidadeFaturamento, cidadeX + 20, row2Y + 5);
  }
  // UF divider
  const ufX = margin + contentWidth - 20;
  doc.line(ufX, row2Y, ufX, y + addrHeight);
  doc.setFont("helvetica", "bold");
  doc.text("UF", ufX + 2, row2Y + 5);
  doc.setFont("helvetica", "normal");
  if (data.ufFaturamento) {
    doc.text(data.ufFaturamento, ufX + 10, row2Y + 5);
  }
  y += addrHeight;

  // Row 6: ENDEREÇO COBRANÇA (with sidebar)
  // Draw horizontal line at top (separating from previous row)
  doc.setDrawColor(...black);
  doc.line(margin, y, margin + contentWidth, y);

  // Sidebar right border
  doc.line(margin + sidebarWidth, y, margin + sidebarWidth, y + addrHeight);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("ENDEREÇO", margin + 2, y + 6);
  doc.text("COBRANÇA:", margin + 2, y + 10);

  // Row 1: Endereço | BAIRRO
  doc.line(addrFieldsX, y + halfHeight, margin + contentWidth, y + halfHeight); // horizontal divider
  // Endereço field (large)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (data.enderecoCobranca) {
    doc.text(data.enderecoCobranca, addrFieldsX + 2, y + 5);
  }
  // BAIRRO divider and label
  doc.line(bairroX, y, bairroX, y + halfHeight);
  doc.setFont("helvetica", "bold");
  doc.text("BAIRRO:", bairroX + 2, y + 5);
  doc.setFont("helvetica", "normal");
  if (data.bairroCobranca) {
    doc.text(data.bairroCobranca, bairroX + 20, y + 5);
  }

  // Row 2: CEP | CIDADE | UF
  const row2Y2 = y + halfHeight;
  // CEP
  doc.setFont("helvetica", "bold");
  doc.text("CEP:", addrFieldsX + 2, row2Y2 + 5);
  doc.setFont("helvetica", "normal");
  if (data.cepCobranca) {
    doc.text(data.cepCobranca, addrFieldsX + 14, row2Y2 + 5);
  }
  // CIDADE divider
  doc.line(cidadeX, row2Y2, cidadeX, y + addrHeight);
  doc.setFont("helvetica", "bold");
  doc.text("CIDADE:", cidadeX + 2, row2Y2 + 5);
  doc.setFont("helvetica", "normal");
  if (data.cidadeCobranca) {
    doc.text(data.cidadeCobranca, cidadeX + 20, row2Y2 + 5);
  }
  // UF divider - stop before the rounded corner
  doc.line(ufX, row2Y2, ufX, y + addrHeight - 4);
  doc.setFont("helvetica", "bold");
  doc.text("UF", ufX + 2, row2Y2 + 5);
  doc.setFont("helvetica", "normal");
  if (data.ufCobranca) {
    doc.text(data.ufCobranca, ufX + 10, row2Y2 + 5);
  }
  y += addrHeight + 5;

  // ==================== PRODUCTS TABLE ====================
  const tableBody = data.produtos.map((p) => [
    p.descricao,
    p.unidade,
    p.volume,
    p.precoUnitario ? `R$ ${p.precoUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "",
    p.total ? `R$ ${p.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "",
  ]);

  // Add empty rows (15 total rows like in HTML)
  while (tableBody.length < 15) {
    tableBody.push(["", "", "", "", ""]);
  }

  const totalGeral = data.produtos.reduce((sum, p) => sum + p.total, 0);

  autoTable(doc, {
    startY: y,
    head: [["DESCRIMINAÇÃO DO PRODUTO", "UNID.", "VOLUME", "PREÇO Un.", "TOTAL"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    tableLineColor: black,
    tableLineWidth: 0.5,
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      lineColor: black,
      lineWidth: 0.3,
      minCellHeight: 5,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: black,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 95, halign: "left" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 27, halign: "center" },
      4: { cellWidth: 28, halign: "center" },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY;

  // VALOR TOTAL DO PEDIDO row
  doc.setDrawColor(...black);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y); // Top border
  doc.rect(margin, y, contentWidth, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("VALOR TOTAL DO PEDIDO:", margin + 3, y + 5.5);
  doc.text(`R$ ${totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, margin + contentWidth - 3, y + 5.5, { align: "right" });
  y += 12;

  // ==================== PAYMENT CONDITIONS ====================
  // Helper: Draw checkbox (square)
  const drawCheckbox = (x: number, yPos: number, checked: boolean) => {
    const size = 3;
    doc.setDrawColor(...black);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos - size + 0.5, size, size, "S");
    if (checked) {
      doc.setFontSize(7);
      doc.text("X", x + 0.5, yPos);
    }
  };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("CONDIÇÕES DE PAGAMENTO:", margin, y);
  y += 4;

  const footerRowHeight = 7;

  // Draw rounded border for payment section
  const paymentSectionHeight = footerRowHeight * 5;
  drawRoundedBorder(margin, y, contentWidth, paymentSectionHeight, 4);

  // Row 1: À VISTA | BONIFICAÇÃO | DADOS BANCÁRIOS
  doc.setFontSize(8);
  drawCheckbox(margin + 3, y + 5, data.condicaoPagamento === "avista");
  doc.text("À VISTA", margin + 8, y + 5);
  drawCheckbox(margin + 35, y + 5, data.condicaoPagamento === "bonificacao");
  doc.text("BONIFICAÇÃO", margin + 40, y + 5);
  // Vertical divider
  doc.setLineWidth(0.3);
  doc.line(margin + 75, y, margin + 75, y + footerRowHeight);
  doc.text(`DADOS BANCÁRIOS: ${data.dadosBancarios || ""}`, margin + 78, y + 5);
  // Horizontal line
  doc.line(margin, y + footerRowHeight, margin + contentWidth, y + footerRowHeight);
  y += footerRowHeight;

  // Row 2: À PRAZO | MOEDA: REAL R$ | DÓLAR US$ | VENCIMENTO
  drawCheckbox(margin + 3, y + 5, data.condicaoPagamento === "aprazo");
  doc.text("À PRAZO", margin + 8, y + 5);
  doc.text("MOEDA:", margin + 35, y + 5);
  drawCheckbox(margin + 53, y + 5, data.moeda === "real");
  doc.text("REAL: R$", margin + 58, y + 5);
  drawCheckbox(margin + 82, y + 5, data.moeda === "dolar");
  doc.text("DÓLAR: US$", margin + 87, y + 5);
  doc.text(`VENCIMENTO:`, margin + 120, y + 5);
  // Draw date fields with slashes
  const vencParts = (data.vencimento || "").split("/");
  doc.line(margin + 145, y + 5.5, margin + 155, y + 5.5);
  doc.text("/", margin + 156, y + 5);
  doc.line(margin + 158, y + 5.5, margin + 168, y + 5.5);
  doc.text("/", margin + 169, y + 5);
  doc.line(margin + 171, y + 5.5, margin + 185, y + 5.5);
  if (vencParts[0]) doc.text(vencParts[0], margin + 147, y + 5);
  if (vencParts[1]) doc.text(vencParts[1], margin + 160, y + 5);
  if (vencParts[2]) doc.text(vencParts[2], margin + 173, y + 5);
  doc.line(margin, y + footerRowHeight, margin + contentWidth, y + footerRowHeight);
  y += footerRowHeight;

  // Row 3: TROCA | SOJA | MILHO | SEMENTE | checkbox
  drawCheckbox(margin + 3, y + 5, data.condicaoPagamento === "troca");
  doc.text("TROCA", margin + 8, y + 5);
  drawCheckbox(margin + 33, y + 5, data.condicaoPagamento === "troca" && data.trocaTipo === "soja");
  doc.text("SOJA EM GRÃOS - SJ$", margin + 38, y + 5);
  drawCheckbox(margin + 80, y + 5, data.condicaoPagamento === "troca" && data.trocaTipo === "milho");
  doc.text("MILHO EM GRÃOS - ML$", margin + 85, y + 5);
  drawCheckbox(margin + 132, y + 5, data.condicaoPagamento === "troca" && data.trocaTipo === "semente");
  doc.text("SEMENTE DE SOJA SM$", margin + 137, y + 5);
  // Extra checkbox at the end
  drawCheckbox(margin + contentWidth - 6, y + 5, false);
  doc.line(margin, y + footerRowHeight, margin + contentWidth, y + footerRowHeight);
  y += footerRowHeight;

  // Row 4: ARMAZÉM | CIDADE | UF
  doc.text("ARMAZÉM PARA ENTREGA DOS GRÃOS NEGOCIADOS:", margin + 3, y + 5);
  doc.text("CIDADE:", margin + 115, y + 5);
  doc.line(margin + 130, y + 5.5, margin + 165, y + 5.5);
  if (data.armazemCidade) doc.text(data.armazemCidade, margin + 132, y + 5);
  doc.text("UF:", margin + 168, y + 5);
  doc.line(margin + 175, y + 5.5, margin + contentWidth - 3, y + 5.5);
  if (data.armazemUf) doc.text(data.armazemUf, margin + 177, y + 5);
  doc.line(margin, y + footerRowHeight, margin + contentWidth, y + footerRowHeight);
  y += footerRowHeight;

  // Row 5: CICLO | FRETE
  doc.text("CICLO:", margin + 3, y + 5);
  drawCheckbox(margin + 18, y + 5, data.ciclo === "safra");
  doc.text("Safra", margin + 23, y + 5);
  drawCheckbox(margin + 40, y + 5, data.ciclo === "safrinha");
  doc.text("Safrinha", margin + 45, y + 5);
  // Right side - Frete
  doc.text("Frete do pedido por conta:", margin + 100, y + 5);
  drawCheckbox(margin + 150, y + 5, data.frete === "cif");
  doc.text("CIF", margin + 155, y + 5);
  drawCheckbox(margin + 170, y + 5, data.frete === "fob");
  doc.text("FOB", margin + 175, y + 5);
  y += footerRowHeight + 3;

  // ==================== OBSERVAÇÕES ====================
  const obsHeight = 20;
  drawRoundedBorder(margin, y, contentWidth, obsHeight, 4);
  doc.text("Obs.:", margin + 3, y + 5);
  // Draw lines for writing
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 3; i++) {
    doc.line(margin + 3, y + 8 + i * 4, margin + contentWidth - 3, y + 8 + i * 4);
  }
  if (data.observacoes) {
    doc.setFontSize(7);
    doc.text(data.observacoes, margin + 3, y + 7, { maxWidth: contentWidth - 6 });
  }
  y += obsHeight + 5;

  // ==================== DISCLAIMER ====================
  doc.setTextColor(255, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CONDIÇÕES GERAIS DE VENDAS: PEDIDO VÁLIDO SOMENTE APÓS APROVAÇÃO DO DPTO. CRÉDITO/COMERCIAL.", pageWidth / 2, y, { align: "center" });
  y += 8;

  // ==================== SIGNATURES ====================
  const sigHeight = 25;
  drawRoundedBorder(margin, y, contentWidth, sigHeight, 4);

  const sigWidth = (contentWidth - 20) / 3;
  const sigY = y + sigHeight - 8;

  // Signature lines
  doc.setDrawColor(...black);
  doc.setLineWidth(0.5);

  const sig1X = margin + 10;
  const sig2X = margin + 10 + sigWidth + 5;
  const sig3X = margin + 10 + (sigWidth + 5) * 2;

  doc.line(sig1X, sigY, sig1X + sigWidth - 10, sigY);
  doc.line(sig2X, sigY, sig2X + sigWidth - 10, sigY);
  doc.line(sig3X, sigY, sig3X + sigWidth - 10, sigY);

  doc.setTextColor(...black);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura do Vendedor", sig1X + (sigWidth - 10) / 2, sigY + 4, { align: "center" });
  doc.text("Visto do Depto. Crédito/Comercial", sig2X + (sigWidth - 10) / 2, sigY + 4, { align: "center" });
  doc.text("Assinatura do Cliente/Comprador", sig3X + (sigWidth - 10) / 2, sigY + 4, { align: "center" });

  return doc;
}
