const pularFormClienteEl = document.getElementById("pular-form-cliente");
// --- DECLARAÇÃO DE VARIÁVEIS GLOBAIS ---
let tabelaDeCustos = {};
const infoForm = document.getElementById("info-form"),
    pricingSection = document.getElementById("pricing-section"),
    submitButton = infoForm.querySelector(".submit-button"),
    dataEl = document.getElementById("data"),
    nomeEl = document.getElementById("nome"),
    telefoneEl = document.getElementById("telefone"),
    estadoEl = document.getElementById("estado"),
    cidadeEl = document.getElementById("cidade"),
    listaCidadesEl = document.getElementById("lista-cidades");
let cidadesValidas = new Set;
const pricingForm = document.getElementById("pricing-form"),
    sementesEl = document.getElementById("sementes"),
    tipoEl = document.getElementById("tipo"),
    embalagemEl = document.getElementById("embalagem"),
    custoProdutoEl = document.getElementById("custo-produto"),
    precoFobEl = document.getElementById("preco-fob"),
    precoCifEl = document.getElementById("preco-cif"),
    gerarPdfBtn = document.getElementById("gerar-pdf-btn");
const calculoConvencionalGroupEl = document.getElementById("calculo-convencional-group");
const kgBatidaEl = document.getElementById("kg-batida");
const purezaInicialEl = document.getElementById("pureza-inicial");
const purezaDesejadaEl = document.getElementById("pureza-desejada");


// --- FUNÇÕES E LÓGICAS QUE RODAM AO CARREGAR A PÁGINA ---
window.onload = function () {
    const e = new Date, t = e.getFullYear(), o = String(e.getMonth() + 1).padStart(2, "0"), n = String(e.getDate()).padStart(2, "0");
    dataEl.value = `${t}-${o}-${n}`;

    // Substitua a URL abaixo pela URL "Raw" do seu arquivo meu-custos.json no GitHub
const URL_CUSTOS_JSON = 'https://raw.githubusercontent.com/walanssouza/calculadora/refs/heads/main/meu-custos.json';

fetch(URL_CUSTOS_JSON)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        tabelaDeCustos = data;
        console.log("Catálogo de preços carregado da web com sucesso!");
    })
    .catch(error => console.error("Erro ao carregar o arquivo de custos:", error));

    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
        .then(e => e.json())
        .then(e => {
            estadoEl.innerHTML = '<option value="">Selecione um estado</option>', e.forEach(e => {
                const t = document.createElement("option");
                t.value = e.id, t.textContent = e.nome, estadoEl.appendChild(t)
            })
        }).catch(e => console.error("Erro ao buscar estados:", e));
};

// --- EVENT LISTENERS (MONITORES DE AÇÃO) ---
telefoneEl.addEventListener("input", function (e) { let t = e.target.value.replace(/\D/g, ""); t = t.slice(0, 11), t.length > 10 ? t = t.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3") : t.length > 6 ? t = t.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3") : t.length > 2 && (t = t.replace(/^(\d{2})(\d*)$/, "($1) $2")), e.target.value = t });
estadoEl.addEventListener("change", function () { const e = this.value; cidadeEl.value = "", listaCidadesEl.innerHTML = "", cidadesValidas.clear(), cidadeEl.classList.remove("input-error"), removerMensagemErro(cidadeEl), e ? (cidadeEl.disabled = !1, cidadeEl.placeholder = "Carregando cidades...", fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${e}/municipios`).then(e => e.json()).then(e => { cidadeEl.placeholder = "Digite ou selecione a cidade", e.forEach(e => { const t = document.createElement("option"); t.value = e.nome, listaCidadesEl.appendChild(t), cidadesValidas.add(e.nome.toLowerCase()) }) }).catch(e => console.error("Erro ao buscar cidades:", e))) : (cidadeEl.disabled = !0, cidadeEl.placeholder = "Selecione um estado primeiro") });
infoForm.addEventListener("submit", function (e) { e.preventDefault(); const t = validarFormulario(); t && (pricingSection.style.display = "block", pricingSection.scrollIntoView({ behavior: "smooth" }), submitButton.textContent = "Informações Salvas", submitButton.disabled = !0, infoForm.querySelectorAll("input, select").forEach(e => { "submit" !== e.type && (e.disabled = !0) })) });
gerarPdfBtn.addEventListener("click", function () { document.getElementById("pdf-cliente-nome").textContent = nomeEl.value; document.getElementById("pdf-cliente-telefone").textContent = telefoneEl.value; document.getElementById("pdf-cliente-local").textContent = `${cidadeEl.value}, ${estadoEl.options[estadoEl.selectedIndex].text}`; document.getElementById("pdf-data").textContent = new Date().toLocaleDateString("pt-BR"); document.getElementById("pdf-produto-semente").textContent = sementesEl.value; document.getElementById("pdf-produto-tipo").textContent = tipoEl.value; document.getElementById("pdf-produto-embalagem").textContent = embalagemEl.value; const quantidadeInput = document.getElementById('quantidade').value; const pesoSaco = parseFloat(embalagemEl.value) || 0; const totalKg = (parseFloat(quantidadeInput) || 0) * pesoSaco; document.getElementById("pdf-produto-quantidade").textContent = `${quantidadeInput||0} SC (${totalKg.toFixed(2)} KG)`; document.getElementById("pdf-financeiro-custo").textContent = custoProdutoEl.value; document.getElementById("pdf-financeiro-margem").textContent = document.getElementById("margem").value + " %"; document.getElementById("pdf-financeiro-imposto").textContent = document.getElementById("imposto").value + " %"; document.getElementById("pdf-financeiro-comissao").textContent = document.getElementById("comissao").value + " %"; document.getElementById("pdf-financeiro-taxas").textContent = document.getElementById("taxas").value + " %"; document.getElementById("pdf-financeiro-frete").textContent = formatarMoeda(parseFloat(document.getElementById("frete").value) || 0); document.getElementById("pdf-financeiro-fob").textContent = precoFobEl.value; document.getElementById("pdf-financeiro-cif").textContent = precoCifEl.value; window.print(); });
tipoEl.addEventListener("change", function () { if (this.value === 'Convencional') { calculoConvencionalGroupEl.style.display = 'block'; embalagemEl.value = "20kg"; } else if (this.value === 'Incrustada') { calculoConvencionalGroupEl.style.display = 'none'; embalagemEl.value = "10kg"; } else { calculoConvencionalGroupEl.style.display = 'none'; embalagemEl.value = ""; } calcularPrecos(); });
pricingForm.addEventListener("input", calcularPrecos);
pularFormClienteEl.addEventListener("change", function() {
    // Encontra o formulário de informações do cliente
    const infoForm = document.getElementById("info-form");

    // Verifica se a caixa de seleção está marcada
    if (this.checked) {
        // Se estiver marcada, oculta o formulário e remove o "required" dos campos
        infoForm.style.display = "none";
        // Remover validação
        infoForm.querySelectorAll("input, select").forEach(campo => {
            campo.removeAttribute("required");
            campo.classList.remove("input-error");
            removerMensagemErro(campo);
        });
        // Mostrar a seção de precificação e ocultar o botão de "Avançar"
        pricingSection.style.display = "block";
        submitButton.style.display = "none";

    } else {
        // Se estiver desmarcada, mostra o formulário e readiciona o "required"
        infoForm.style.display = "block";
        infoForm.querySelectorAll("input, select").forEach(campo => {
            // Apenas os campos que precisam ser validados (exceto data)
            if (campo.id !== 'data' && campo.id !== 'cidade') {
                campo.setAttribute("required", "");
            }
        });
        // A seção de precificação só aparecerá após o formulário ser validado
        pricingSection.style.display = "none";
        submitButton.style.display = "block";
    }
});

// --- FUNÇÕES DE CÁLCULO ---
function calcularPrecos() {
    const tipoSelecionado = tipoEl.value;
    const sementeSelecionada = sementesEl.value;

    let custoNoSaco = 0;

    // Lógica para o tipo Incrustada
    if (tipoSelecionado === 'Incrustada' && sementeSelecionada) {
        if (tabelaDeCustos.sementes && tabelaDeCustos.sementes[sementeSelecionada]) {
            custoNoSaco = tabelaDeCustos.sementes[sementeSelecionada].Incrustada;
        }
    } else if (tipoSelecionado === 'Convencional' && sementeSelecionada) {
        // Lógica para o tipo Convencional (que usaremos o novo cálculo)
        custoNoSaco = calcularCustoConvencional();
    }
    
    // Adiciona os custos de embalagem (para ambos os tipos)
    let custoFinalProduto = custoNoSaco;
    if (custoFinalProduto > 0) {
        const custosGerais = tabelaDeCustos.custos_gerais;
        if (custosGerais) {
            const custoEmbalagemTotal =
                (custosGerais.custo_saco_embalagem || 0) +
                (custosGerais.custo_adesivo_nome || 0) +
                (custosGerais.custo_adesivo_info || 0);
            custoFinalProduto += custoEmbalagemTotal;
        }
    }

    custoProdutoEl.value = custoFinalProduto ? formatarMoeda(custoFinalProduto) : "";
    
    // A lógica de preço FOB e CIF continua a mesma
    const podeGerarPdf = custoFinalProduto && precoFobEl.value && !precoFobEl.value.includes("inválidas");
    gerarPdfBtn.disabled = !podeGerarPdf;
    if (!custoFinalProduto) {
        precoFobEl.value = "";
        precoCifEl.value = "";
        return;
    }

    const margem = parseFloat(document.getElementById("margem").value) / 100 || 0;
    const imposto = parseFloat(document.getElementById("imposto").value) / 100 || 0;
    const comissao = parseFloat(document.getElementById("comissao").value) / 100 || 0;
    const taxas = parseFloat(document.getElementById("taxas").value) / 100 || 0;
    const frete = parseFloat(document.getElementById("frete").value) || 0;
    
    const divisor = 1 - margem - imposto - comissao - taxas;
    if (divisor <= 0) {
        precoFobEl.value = "Margens inválidas";
        precoCifEl.value = "Margens inválidas";
        return;
    }
    
    const precoFob = custoFinalProduto / divisor;
    precoFobEl.value = formatarMoeda(precoFob);
    
    const precoCif = (custoFinalProduto + frete) / divisor;
    precoCifEl.value = formatarMoeda(precoCif);
}

function calcularCustoConvencional() {
    // 1. Coleta e validação dos dados de entrada
    const semente = sementesEl.value;
    const kgBatida = parseFloat(kgBatidaEl.value) || 0;
    const purezaInicial = parseFloat(purezaInicialEl.value) || 0;
    const purezaDesejada = parseFloat(purezaDesejadaEl.value) || 0;
    if (!semente || !kgBatida || !purezaInicial || !purezaDesejada || purezaInicial < purezaDesejada) {
        return null;
    }
    const dadosSemente = tabelaDeCustos.sementes[semente];
    const custosGerais = tabelaDeCustos.custos_gerais;
    if (!dadosSemente || !custosGerais) {
        return null;
    }
    const valorDoPonto = dadosSemente.valor_do_ponto;
    const custoDaPalhaKg = custosGerais.custo_da_palha_kg;
    const custoDoGranuladoKg = custosGerais.custo_do_granulado_kg;
    const custoAnalise = custosGerais.custo_analise_laboratorio;
    
    // 2. Cálculos baseados na sua nova e correta fórmula
    const pontosUtilizados = kgBatida * purezaDesejada;
    const quantidadeSementesUtilizadas = pontosUtilizados / purezaInicial;
    const custoSemente = pontosUtilizados * valorDoPonto;
    const perdaMassa = kgBatida - quantidadeSementesUtilizadas;
    const quantidadePalha = perdaMassa * 0.20;
    const custoTotalPalha = quantidadePalha * custoDaPalhaKg;
    const quantidadeGranulado = perdaMassa - quantidadePalha;
    const custoTotalGranulado = quantidadeGranulado * custoDoGranuladoKg;
    const custoComABatida = custoSemente + custoTotalPalha + custoTotalGranulado + custoAnalise;
    if (kgBatida === 0) return 0;
    const custoBrutoPorKg = custoComABatida / kgBatida;
    
    // Calcula o custo do produto puro por saco (sem custos de embalagem)
    const custoFinalDoSacoPuro = custoBrutoPorKg * 20;

    return custoFinalDoSacoPuro;
}

// --- FUNÇÕES DE APOIO (Validação, formatação, etc.) ---
function validarFormulario() { let e = !0; const t = nomeEl, o = telefoneEl, n = estadoEl, a = cidadeEl; return "" === t.value.trim() ? (e = !1, t.classList.add("input-error"), mostrarMensagemErro(t, "Este campo é obrigatório.")) : removerMensagemErro(t), "" === o.value.trim() ? (e = !1, o.classList.add("input-error"), mostrarMensagemErro(o, "Este campo é obrigatório.")) : o.value.length < 14 ? (e = !1, o.classList.add("input-error"), mostrarMensagemErro(o, "Telefone incompleto.")) : removerMensagemErro(o), "" === n.value ? (e = !1, n.classList.add("input-error"), mostrarMensagemErro(n, "Por favor, selecione um estado.")) : removerMensagemErro(n), a.disabled || "" === a.value.trim() ? (e = !1, a.classList.add("input-error"), mostrarMensagemErro(a, "Este campo é obrigatório.")) : cidadesValidas.has(a.value.trim().toLowerCase()) ? removerMensagemErro(a) : (e = !1, a.classList.add("input-error"), mostrarMensagemErro(a, "Cidade não pertence ao estado.")), e }
function formatarMoeda(e) { return isNaN(e) || !isFinite(e) ? "" : e.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }
function mostrarMensagemErro(e, t) { removerMensagemErro(e); const o = document.createElement("span"); o.className = "error-message", o.textContent = t, e.parentNode.appendChild(o) }
function removerMensagemErro(e) { const t = e.parentNode, o = t.querySelector(".error-message"); o && t.removeChild(o) }

// Roda um cálculo inicial para limpar os campos
calcularPrecos();