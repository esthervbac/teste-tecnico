import json
import os

def calcular_comissao(valor: float) -> float:
    if valor < 100.00:
        return 0.0
    elif valor < 500.00:
        return valor * 0.01  # 1%
    else:
        return valor * 0.05  # 5%

def processar_vendas():
    dados_json = "json/vendas.json"

    if not os.path.exists(dados_json):
        print(f"Erro: O arquivo '{dados_json}' não foi encontrado!")
        return

    with open(dados_json, "r", encoding="utf-8") as arquivo:
        dados = json.load(arquivo)

    relatorio = {}

    for venda in dados.get("vendas", []):
        vendedor = venda["vendedor"]
        valor = venda["valor"]
        comissao = calcular_comissao(valor)

        if vendedor not in relatorio:
            relatorio[vendedor] = {"total_vendas": 0.0, "total_comissao": 0.0}

        relatorio[vendedor]["total_vendas"] += valor
        relatorio[vendedor]["total_comissao"] += comissao

    return relatorio

if __name__ == "__main__":
    resultado = processar_vendas()

    if resultado:
        print("=== RELATÓRIO DE COMISSÕES (EM PYTHON) ===")
        for vendedor, totais in resultado.items():
            print(f"Vendedor: {vendedor}")
            print(f"  Total Vendido:  R$ {totais['total_vendas']:.2f}")
            print(f"  Total Comissão: R$ {totais['total_comissao']:.2f}\n")