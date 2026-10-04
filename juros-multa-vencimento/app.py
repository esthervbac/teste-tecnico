from datetime import datetime, date

TAXA_MULTA_DIARIA = 0.025  # 2.5% ao dia

def calcular_juros_vencimento(valor_original: float, data_vencimento_str: str) -> dict:
    """
    Calcula o valor dos juros acumulados até hoje com base na data de vencimento.
    Formato esperado para data_vencimento_str: 'YYYY-MM-DD' ou 'DD/MM/YYYY'
    """
    try:
        if "/" in data_vencimento_str:
            data_vencimento = datetime.strptime(data_vencimento_str, "%d/%m/%Y").date()
        else:
            data_vencimento = datetime.strptime(data_vencimento_str, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Data em formato inválido. Use 'DD/MM/YYYY' ou 'YYYY-MM-DD'.")

    data_hoje = date.today()
    dias_atraso = (data_hoje - data_vencimento).days

    if dias_atraso <= 0:
        dias_atraso = 0
        valor_juros = 0.0
        valor_total = valor_original
        status = "Em dia / A vencer"
    else:
        valor_juros = valor_original * (TAXA_MULTA_DIARIA * dias_atraso)
        valor_total = valor_original + valor_juros
        status = f"Em atraso ({dias_atraso} dia(s))"

    return {
        "valor_original": valor_original,
        "data_vencimento": data_vencimento.strftime("%d/%m/%Y"),
        "data_calculo": data_hoje.strftime("%d/%m/%Y"),
        "dias_atraso": dias_atraso,
        "valor_juros": valor_juros,
        "valor_total": valor_total,
        "status": status
    }

def menu_interativo():
    print("=== CÁLCULO DE JUROS E MULTA DE VENCIMENTO (EM PYTHON) ===")
    try:
        valor_str = input("Digite o valor original (R$): ").replace(",", ".").strip()
        valor = float(valor_str)

        vencimento_str = input("Digite a data de vencimento (DD/MM/YYYY ou YYYY-MM-DD): ").strip()

        resultado = calcular_juros_vencimento(valor, vencimento_str)

        print("\n" + "=" * 45)
        print("=== RELATÓRIO DE CÁLCULO DE JUROS ===")
        print(f"Status:               {resultado['status']}")
        print(f"Data de Vencimento:   {resultado['data_vencimento']}")
        print(f"Data Atual (Hoje):    {resultado['data_calculo']}")
        print(f"Valor Original:       R$ {resultado['valor_original']:.2f}")
        print(f"Dias em Atraso:       {resultado['dias_atraso']} dia(s)")
        print(f"Taxa Diária:          2.5% ao dia")
        print(f"Valor dos Juros:      R$ {resultado['valor_juros']:.2f}")
        print(f"VALOR TOTAL A PAGAR:  R$ {resultado['valor_total']:.2f}")
        print("=" * 45 + "\n")

    except ValueError as err:
        print(f"\n❌ Erro de Entrada: {err}\n")

if __name__ == "__main__":
    menu_interativo()