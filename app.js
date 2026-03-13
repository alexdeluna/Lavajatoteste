let banco = JSON.parse(localStorage.getItem("lavagens")) || []

/* ===================== MENU ===================== */
function abrirTela(tela){
document.getElementById("menu").style.display="none"
document.querySelectorAll(".tela").forEach(t=> t.style.display="none")
document.getElementById(tela).style.display="block"
}

function voltarMenu(){
document.querySelectorAll(".tela").forEach(t=> t.style.display="none")
document.getElementById("menu").style.display="block"
}

/* ===================== NORMALIZAÇÃO ===================== */
function limparNumero(numero){ return numero.replace(/\D/g,'') }
function limparPlaca(placa){ return placa.toUpperCase().replace(/\s+/g,'') }

/* ===================== TABELA DE PREÇOS ===================== */
const tabelaPrecos = {
passeio:{simples:30, completa:50},
utilitario:{simples:40, completa:70},
pickup:{simples:50, completa:80},
moto:{simples:15, completa:25}
}

/* ===================== CALCULAR PREÇO ===================== */
function calcularPreco(){
let veiculo = document.getElementById("tipoVeiculo").value
let lavagem = document.getElementById("tipoLavagem").value
if(!veiculo || !lavagem) return
document.getElementById("valor").value = tabelaPrecos[veiculo][lavagem]
}
document.getElementById("tipoVeiculo").addEventListener("change",calcularPreco)
document.getElementById("tipoLavagem").addEventListener("change",calcularPreco)

/* ===================== REGISTRAR LAVAGEM ===================== */
function registrarLavagem(){
let placa = limparPlaca(document.getElementById("placa").value)
let nome = document.getElementById("nome").value.trim()
let telefone = limparNumero(document.getElementById("telefone").value)
let tipoVeiculo = document.getElementById("tipoVeiculo").value
let tipoLavagem = document.getElementById("tipoLavagem").value
let valor = document.getElementById("valor").value

if(!placa || !nome || !telefone || !tipoVeiculo || !tipoLavagem){
alert("Preencha todos os campos")
return
}

let agora = new Date()
let registro = {placa,nome,telefone,tipoVeiculo,tipoLavagem,valor,data:agora.toISOString()}
banco.push(registro)
localStorage.setItem("lavagens",JSON.stringify(banco))

alert(`Lavagem registrada com sucesso! Valor: R$ ${valor}`)

document.getElementById("placa").value=""
document.getElementById("nome").value=""
document.getElementById("telefone").value=""
document.getElementById("tipoVeiculo").value=""
document.getElementById("tipoLavagem").value=""
document.getElementById("valor").value=""
}

/* ===================== CONSULTAR VEÍCULO ===================== */
function consultarVeiculo(){
let placa = limparPlaca(document.getElementById("placaConsulta").value)
let registros = banco.filter(r=>r.placa===placa)
let resultado = document.getElementById("resultadoConsulta")
if(registros.length===0){
resultado.innerHTML="Veículo não encontrado"
return
}
let cliente = registros[0]
let ultima = registros[registros.length-1]
let dataUltima = new Date(ultima.data)
let dias = (Date.now()-dataUltima)/(1000*60*60*24)
let alerta = dias>15 ? "<div class='alerta'>Cliente pode ser chamado novamente</div>" : ""

let historico = ""
let totalGasto = 0
registros.forEach(r=>{
let d = new Date(r.data)
historico += `<div>${d.toLocaleDateString()} ${d.toLocaleTimeString()} - ${r.tipoVeiculo} ${r.tipoLavagem} - R$ ${r.valor}</div>`
totalGasto += Number(r.valor)
})

let numeroWhats = limparNumero(cliente.telefone)
let mensagem = `Olá ${cliente.nome}, vimos que já faz um tempo desde a última lavagem do seu veículo (${placa}). Que tal trazer novamente ao nosso lava-jato?`
let mensagemFormatada = encodeURIComponent(mensagem)
let linkWhats = `https://wa.me/55${numeroWhats}?text=${mensagemFormatada}`

resultado.innerHTML = `
<div class="card">
<strong>Placa:</strong> ${placa}<br>
Cliente: ${cliente.nome}<br>
Telefone: ${numeroWhats}<br>
Última lavagem: ${dataUltima.toLocaleDateString()}<br>
Total de lavagens: ${registros.length}<br>
Total gasto: R$ ${totalGasto}<br>
${alerta}<br><br>
<a href="${linkWhats}" target="_blank"><button>Chamar no WhatsApp</button></a>
<h3>Histórico de Lavagens</h3>
${historico}
</div>
`
}
