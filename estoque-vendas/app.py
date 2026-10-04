import json
import os
from typing import Dict, Any, Optional

CAMINHO_JSON = os.path.join("json", "estoque.json")

def carregar_estoque() -> Dict[str, Any]:
    """Carrega os dados de estoque do arquivo JSON."""
    if not os.path.exists(CAMINHO_JSON):
        raise FileNotFoundError(f"Arquivo '{CAMINHO_JSON}' não foi encontrado.")
    with open(CAMINHO_JSON, "r", encoding="utf-8") as file:
        return json.load(file)

def salvar_estoque(dados: Dict[str, Any]) -> None:
    """Salva os dados atualizados de estoque de volta no JSON."""
    with open(CAMINHO_JSON, "w", encoding="utf-8") as file:
        json.dump(dados, file, indent=2, ensure_ascii=False)

def listar_produtos() -> None:
    """Exibe os produtos e saldos atuais cadastrados no JSON."""
    dados = carregar_estoque()
    print("\n=== PRODUTOS CADASTRADOS NO ESTOQUE ===")
    print(f"{'CÓDIGO':<10} | {'DESCRIÇÃO':<30} | {'ESTOQUE ATUAL':<15}")
    print("-" * 60)
    for p in dados.get("estoque", []):
        print(f"{p['codigoProduto']:<10} | {p['descricaoProduto']:<30} | {p['estoque']:<15}")
    print("-" * 60)

def registrar_movimentacao(
    id_movimentacao: int,
    codigo_produto: int,
    tipo: str,
    quantidade: int,
    descricao: str
) -> Optional[int]:
    """Registra uma movimentação de estoque (ENTRADA ou SAIDA) e atualiza o JSON."""
    if quantidade <= 0:
        print("\n❌ Erro: A quantidade deve ser maior que zero.")
        return None

    tipo_normalizado = tipo.strip().upper()
    if tipo_normalizado not in ["ENTRADA", "SAIDA"]:
        print("\n❌ Erro: O tipo deve ser 'ENTRADA' ou 'SAIDA'.")
        return None

    dados = carregar_estoque()
    produtos = dados.get("estoque", [])

    produto = next((p for p in produtos if p["codigoProduto"] == codigo_produto), None)

    if not produto:
        print(f"\n❌ Erro: Produto com código {codigo_produto} não foi encontrado.")
        return None

    if tipo_normalizado == "ENTRADA":
        produto["estoque"] += quantidade
    elif tipo_normalizado == "SAIDA":
        if produto["estoque"] < quantidade:
            print(f"\n❌ Erro: Estoque insuficiente ({produto['estoque']}) para a saída solicitada ({quantidade}).")
            return None
        produto["estoque"] -= quantidade

    salvar_estoque(dados)

    print("\n" + "=" * 45)
    print(f"✅ Movimentação #{id_movimentacao} Registrada com Sucesso!")
    print(f"Descrição: {descricao}")
    print(f"Tipo: {tipo_normalizado}")
    print(f"Produto: {produto['descricaoProduto']} (Cód: {produto['codigoProduto']})")
    print(f"Quantidade Movimentada: {quantidade}")
    print(f"Estoque Final Atualizado: {produto['estoque']} unidades")
    print("=" * 45 + "\n")

    return produto["estoque"]

def menu_interativo():
    """Interface de linha de comando para interagir com o usuário."""
    id_counter = 1 

    while True:
        print("\n=== SISTEMA DE GESTÃO DE ESTOQUE (EM PYTHON) ===")
        print("1. Listar Produtos e Estoque Atual")
        print("2. Lançar Movimentação de Estoque")
        print("3. Sair")
        
        opcao = input("Escolha uma opção (1-3): ").strip()

        if opcao == "1":
            listar_produtos()
        
        elif opcao == "2":
            try:
                listar_produtos()
                print("\n--- NOVO LANÇAMENTO ---")
                
                cod_produto = int(input("Digite o CÓDIGO do produto: "))
                
                print("Tipos disponíveis: ENTRADA ou SAIDA")
                tipo_mov = input("Digite o tipo da movimentação: ").strip().upper()
                
                qtd = int(input("Digite a quantidade: "))
                desc = input("Digite uma descrição (motivo da movimentação): ").strip()

                registrar_movimentacao(
                    id_movimentacao=id_counter,
                    codigo_produto=cod_produto,
                    tipo=tipo_mov,
                    quantidade=qtd,
                    descricao=desc
                )
                id_counter += 1

            except ValueError:
                print("\n❌ Erro: Por favor, insira números válidos para código e quantidade.")
        
        elif opcao == "3":
            print("\nSaindo do sistema... Até logo!")
            break
        else:
            print("\n❌ Opção inválida. Tente novamente.")

if __name__ == "__main__":
    menu_interativo()