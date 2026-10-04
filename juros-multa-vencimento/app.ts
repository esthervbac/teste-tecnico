import * as readline from "readline";

const TAXA_MULTA_DIARIA = 0.025; // 2.5% ao dia

interface ResultadoCalculo {
  valorOriginal: number;
  dataVencimento: string;
  dataCalculo: string;
  diasAtraso: number;
  valorJuros: number;
  valorTotal: number;
  status: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pergunta = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

function parseData(dataStr: string): Date {
  let ano: number, mes: number, dia: number;

  if (dataStr.includes("/")) {
    const partes = dataStr.split("/");
    if (partes.length !== 3) throw new Error("Formato de data inválido.");
    dia = parseInt(partes[0]!, 10);
    mes = parseInt(partes[1]!, 10) - 1;
    ano = parseInt(partes[2]!, 10);
  } else if (dataStr.includes("-")) {
    const partes = dataStr.split("-");
    if (partes.length !== 3) throw new Error("Formato de data inválido.");
    ano = parseInt(partes[0]!, 10);
    mes = parseInt(partes[1]!, 10) - 1;
    dia = parseInt(partes[2]!, 10);
  } else {
    throw new Error("Use o formato 'DD/MM/YYYY' ou 'YYYY-MM-DD'.");
  }

  const dataParsed = new Date(ano, mes, dia);
  dataParsed.setHours(0, 0, 0, 0);
  return dataParsed;
}

function calcularJurosVencimento(
  valorOriginal: number,
  dataVencimentoStr: string,
): ResultadoCalculo {
  const dataVencimento = parseData(dataVencimentoStr);
  const dataHoje = new Date();
  dataHoje.setHours(0, 0, 0, 0);

  const diffTempo = dataHoje.getTime() - dataVencimento.getTime();
  const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));

  let diasAtraso = 0;
  let valorJuros = 0;
  let valorTotal = valorOriginal;
  let status = "Em dia / A vencer";

  if (diffDias > 0) {
    diasAtraso = diffDias;
    valorJuros = valorOriginal * (TAXA_MULTA_DIARIA * diasAtraso);
    valorTotal = valorOriginal + valorJuros;
    status = `Em atraso (${diasAtraso} dia(s))`;
  }

  const formatarData = (d: Date) =>
    d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return {
    valorOriginal,
    dataVencimento: formatarData(dataVencimento),
    dataCalculo: formatarData(dataHoje),
    diasAtraso,
    valorJuros,
    valorTotal,
    status,
  };
}

async function menuInterativo(): Promise<void> {
  console.log("=== CÁLCULO DE JUROS E MULTA DE VENCIMENTO (EM TYPESCRIPT) ===");

  try {
    const valorInput = await pergunta("Digite o valor original (R$): ");
    const valor = parseFloat(valorInput.replace(",", ".").trim());

    if (isNaN(valor) || valor <= 0) {
      throw new Error("Valor inválido. Digite um número positivo.");
    }

    const vencimentoInput = (
      await pergunta("Digite a data de vencimento (DD/MM/YYYY ou YYYY-MM-DD): ")
    ).trim();

    const resultado = calcularJurosVencimento(valor, vencimentoInput);

    console.log("\n" + "=".repeat(45));
    console.log("=== RELATÓRIO DE CÁLCULO DE JUROS ===");
    console.log(`Status:               ${resultado.status}`);
    console.log(`Data de Vencimento:   ${resultado.dataVencimento}`);
    console.log(`Data Atual (Hoje):    ${resultado.dataCalculo}`);
    console.log(
      `Valor Original:       R$ ${resultado.valorOriginal.toFixed(2)}`,
    );
    console.log(`Dias em Atraso:       ${resultado.diasAtraso} dia(s)`);
    console.log(`Taxa Diária:          2.5% ao dia`);
    console.log(`Valor dos Juros:      R$ ${resultado.valorJuros.toFixed(2)}`);
    console.log(`VALOR TOTAL A PAGAR:  R$ ${resultado.valorTotal.toFixed(2)}`);
    console.log("=".repeat(45) + "\n");
  } catch (error: any) {
    console.error(`\n❌ Erro: ${error.message}\n`);
  } finally {
    rl.close();
  }
}

menuInterativo();
