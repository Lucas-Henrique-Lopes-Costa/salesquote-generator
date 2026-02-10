export interface Product {
  id: string;
  descricao: string;
  unidade: string;
  volume: string;
  precoUnitario: number;
  total: number;
}

export interface OrderFormData {
  vendedor: string;
  codigo: string;
  ordemCompra: string;
  data: string;
  razaoSocial: string;
  pessoa: 'fisica' | 'juridica';
  cnpjCpf: string;
  ieRg: string;
  contato: string;
  fone: string;
  email: string;
  enderecoFaturamento: string;
  cepFaturamento: string;
  cidadeFaturamento: string;
  ufFaturamento: string;
  enderecoCobranca: string;
  cepCobranca: string;
  cidadeCobranca: string;
  ufCobranca: string;
  produtos: Product[];
  condicaoPagamento: 'avista' | 'aprazo' | 'bonificacao' | 'troca';
  moeda: 'real' | 'dolar';
  vencimento: string;
  trocaTipo: 'soja' | 'milho' | 'semente';
  trocaValor: string;
  armazemCidade: string;
  armazemUf: string;
  ciclo: 'safra' | 'safrinha';
  frete: 'cif' | 'fob';
  dadosBancarios: string;
  observacoes: string;
}
