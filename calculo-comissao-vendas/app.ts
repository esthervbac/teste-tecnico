import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Venda {
  vendedor: string;
  valor: number;
}

interface DadosVendas {
  vendas: Venda[];
}

interface TotaisVendedor {
  totalVendas: number;
  totalComissao: number;
}

type RelatorioComissao = Record<string, TotaisVendedor>;

function calcularComissao(valor: number): number {
  if (valor < 100.0) {
    return 0;
  } else if (valor < 500.0) {
    return valor * 0.01; // 1%
  } else {
    return valor * 0.05; // 5%
  }
}

function processarVendas(): RelatorioComissao | void {
  const caminhoDoJson = path.join(__dirname, "json", "vendas.json");

  if (!fs.existsSync(caminhoDoJson)) {
    console.error(
      `Erro: O arquivo 'vendas.json' não foi encontrado em ${caminhoDoJson}`,
    );
    return;
  }

  const conteudo = fs.readFileSync(caminhoDoJson, "utf-8");
  const dados: DadosVendas = JSON.parse(conteudo);

  const relatorio: RelatorioComissao = {};

  for (const venda of dados.vendas) {
    const { vendedor, valor } = venda;
    const comissao = calcularComissao(valor);

    if (!relatorio[vendedor]) {
      relatorio[vendedor] = { totalVendas: 0, totalComissao: 0 };
    }

    relatorio[vendedor].totalVendas += valor;
    relatorio[vendedor].totalComissao += comissao;
  }

  return relatorio;
}

const resultado = processarVendas();

if (resultado) {
  console.log("=== RELATÓRIO DE COMISSÕES (EM TYPESCRIPT) ===");
  for (const [vendedor, totais] of Object.entries(resultado)) {
    console.log(`Vendedor: ${vendedor}`);
    console.log(`  Total Vendido:  R$ ${totais.totalVendas.toFixed(2)}`);
    console.log(`  Total Comissão: R$ ${totais.totalComissao.toFixed(2)}\n`);
  }
}
