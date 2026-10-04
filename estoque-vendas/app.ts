import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Produto {
  codigoProduto: number;
  descricaoProduto: string;
  estoque: number;
}

interface DadosEstoque {
  estoque: Produto[];
}

type TipoMovimentacao = "ENTRADA" | "SAIDA";

interface Movimentacao {
  idMovimentacao: number;
  codigoProduto: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  descricao: string;
}

const CAMINHO_JSON = path.join(__dirname, "json", "estoque.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pergunta = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

function carregarEstoque(): DadosEstoque {
  if (!fs.existsSync(CAMINHO_JSON)) {
    throw new Error(`Arquivo '${CAMINHO_JSON}' não foi encontrado.`);
  }
  const conteudo = fs.readFileSync(CAMINHO_JSON, "utf-8");
  return JSON.parse(conteudo) as DadosEstoque;
}

function salvarEstoque(dados: DadosEstoque): void {
  fs.writeFileSync(CAMINHO_JSON, JSON.stringify(dados, null, 2), "utf-8");
}

function listarProdutos(): void {
  const dados = carregarEstoque();
  console.log("\n=== PRODUTOS CADASTRADOS NO ESTOQUE ===");
  console.log(
    "CÓDIGO".padEnd(10) +
      " | " +
      "DESCRIÇÃO".padEnd(30) +
      " | " +
      "ESTOQUE ATUAL".padEnd(15),
  );
  console.log("-".repeat(60));

  for (const p of dados.estoque) {
    const cod = p.codigoProduto.toString().padEnd(10);
    const desc = p.descricaoProduto.padEnd(30);
    const est = p.estoque.toString().padEnd(15);
    console.log(`${cod} | ${desc} | ${est}`);
  }
  console.log("-".repeat(60));
}

function registrarMovimentacao(movimentacao: Movimentacao): number | null {
  const { idMovimentacao, codigoProduto, tipo, quantidade, descricao } =
    movimentacao;

  if (quantidade <= 0) {
    console.error("\n❌ Erro: A quantidade deve ser maior que zero.");
    return null;
  }

  const dados = carregarEstoque();
  const produto = dados.estoque.find((p) => p.codigoProduto === codigoProduto);

  if (!produto) {
    console.error(
      `\n❌ Erro: Produto com código ${codigoProduto} não foi encontrado.`,
    );
    return null;
  }

  if (tipo === "ENTRADA") {
    produto.estoque += quantidade;
  } else if (tipo === "SAIDA") {
    if (produto.estoque < quantidade) {
      console.error(
        `\n❌ Erro: Estoque insuficiente (${produto.estoque}) para a saída de ${quantidade}.`,
      );
      return null;
    }
    produto.estoque -= quantidade;
  } else {
    console.error("\n❌ Erro: O tipo deve ser 'ENTRADA' ou 'SAIDA'.");
    return null;
  }

  salvarEstoque(dados);

  console.log("\n" + "=".repeat(45));
  console.log(`✅ Movimentação #${idMovimentacao} Registrada com Sucesso!`);
  console.log(`Descrição: ${descricao}`);
  console.log(`Tipo: ${tipo}`);
  console.log(
    `Produto: ${produto.descricaoProduto} (Cód: ${produto.codigoProduto})`,
  );
  console.log(`Quantidade Movimentada: ${quantidade}`);
  console.log(`Estoque Final Atualizado: ${produto.estoque} unidades`);
  console.log("=".repeat(45) + "\n");

  return produto.estoque;
}

async function menuInterativo(): Promise<void> {
  let idCounter = 1;
  let rodando = true;

  while (rodando) {
    console.log("\n=== SISTEMA DE GESTÃO DE ESTOQUE (EM TYPESCRIPT) ===");
    console.log("1. Listar Produtos e Estoque Atual");
    console.log("2. Lançar Movimentação de Estoque");
    console.log("3. Sair");

    const opcao = (await pergunta("Escolha uma opção (1-3): ")).trim();

    if (opcao === "1") {
      listarProdutos();
    } else if (opcao === "2") {
      listarProdutos();
      console.log("\n--- NOVO LANÇAMENTO ---");

      const inputCod = await pergunta("Digite o CÓDIGO do produto: ");
      const codProduto = Number(inputCod);

      console.log("Tipos disponíveis: ENTRADA ou SAIDA");
      const tipoInput = (await pergunta("Digite o tipo da movimentação: "))
        .trim()
        .toUpperCase();

      const inputQtd = await pergunta("Digite a quantidade: ");
      const qtd = Number(inputQtd);

      const desc = (
        await pergunta("Digite uma descrição (motivo da movimentação): ")
      ).trim();

      if (isNaN(codProduto) || isNaN(qtd)) {
        console.error(
          "\n❌ Erro: Por favor, insira números válidos para código e quantidade.",
        );
      } else if (tipoInput !== "ENTRADA" && tipoInput !== "SAIDA") {
        console.error(
          "\n❌ Erro: O tipo deve ser apenas 'ENTRADA' ou 'SAIDA'.",
        );
      } else {
        registrarMovimentacao({
          idMovimentacao: idCounter,
          codigoProduto: codProduto,
          tipo: tipoInput as TipoMovimentacao,
          quantidade: qtd,
          descricao: desc,
        });
        idCounter++;
      }
    } else if (opcao === "3") {
      console.log("\nSaindo do sistema... Até logo!");
      rodando = false;
      rl.close();
    } else {
      console.log("\n❌ Opção inválida. Tente novamente.");
    }
  }
}

menuInterativo();
