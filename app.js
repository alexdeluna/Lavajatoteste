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
let tabelaPrecos = JSON.parse(localStorage.getItem("precos")) || {

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
if(!placa || !nome || !telefone || !tipoVeiculo || !tipoLavagem){alert("Preencha todos os campos"); return}
let agora = new Date()
let registro = {placa,nome,telefone,tipoVeiculo,tipoLavagem,valor,data:agora.toISOString()}
banco.push(registro)
localStorage.setItem("lavagens",JSON.stringify(banco))
alert(`Lavagem registrada! Valor: R$ ${valor}`)
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
if(registros.length===0){resultado.innerHTML="Veículo não encontrado"; return}
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
let linkWhats = `https://wa.me/55${numeroWhats}?text=${encodeURIComponent(mensagem)}`
resultado.innerHTML = `<div class="card"><strong>Placa:</strong> ${placa}<br>Cliente: ${cliente.nome}<br>Telefone: ${numeroWhats}<br>Última lavagem: ${dataUltima.toLocaleDateString()}<br>Total de lavagens: ${registros.length}<br>Total gasto: R$ ${totalGasto}<br>${alerta}<br><br><a href="${linkWhats}" target="_blank"><button>Chamar no WhatsApp</button></a><h3>Histórico de Lavagens</h3>${historico}</div>`
}

/* ===================== DASHBOARD ===================== */
let chartFaturamento = null
function atualizarDashboard(){
const agora = new Date()
const hoje = agora.toDateString()
let faturamentoHoje=0, faturamentoSemana=0, faturamentoMes=0
let clientes = {}, listaChamar=[]
let datasGrafico = [], valoresGrafico=[]
banco.forEach(r=>{
let dataLavagem = new Date(r.data)
let valor = Number(r.valor)
if(dataLavagem.toDateString()===hoje) faturamentoHoje+=valor
if((agora-dataLavagem)/(1000*60*60*24)<=7) faturamentoSemana+=valor
if(dataLavagem.getMonth()===agora.getMonth() && dataLavagem.getFullYear()===agora.getFullYear()) faturamentoMes+=valor
if (clientes[r.nome]) {
    clientes[r.nome] += 1
} else {
    clientes[r.nome] = 1
}
if((agora-dataLavagem)/(1000*60*60*24)>15 && !listaChamar.find(c=>c.nome===r.nome && c.placa===r.placa))
listaChamar.push({nome:r.nome, placa:r.placa, telefone:r.telefone})
})
document.getElementById("faturamentoHoje").innerText = faturamentoHoje.toFixed(2)
document.getElementById("faturamentoSemana").innerText = faturamentoSemana.toFixed(2)
document.getElementById("faturamentoMes").innerText = faturamentoMes.toFixed(2)
/* Ranking */
let ranking = Object.entries(clientes).sort((a,b)=>b[1]-a[1])
let ulClientes = document.getElementById("listaClientes")
ulClientes.innerHTML=""
ranking.forEach(c=>{ulClientes.innerHTML+=`<li>${c[0]} - ${c[1]} lavagens</li>`})
/* Clientes para chamar */
let ulChamar = document.getElementById("listaChamar")
ulChamar.innerHTML=""
listaChamar.forEach(c=>{
let numeroWhats = limparNumero(c.telefone)
let mensagem = `Olá ${c.nome}, percebemos que já faz um tempo desde a última lavagem do seu veículo (${c.placa}). Que tal trazer novamente?`
let linkWhats = `https://wa.me/55${numeroWhats}?text=${encodeURIComponent(mensagem)}`
ulChamar.innerHTML += `<li>${c.nome} (${c.placa}) <a href="${linkWhats}" target="_blank"><button>Chamar no WhatsApp</button></a></li>`
})
/* Gráfico faturamento últimos 7 dias */
datasGrafico=[], valoresGrafico=[]
for(let i=6;i>=0;i--){
let dia = new Date()
dia.setDate(agora.getDate()-i)
let diaStr = `${dia.getDate()}/${dia.getMonth()+1}`
datasGrafico.push(diaStr)
let valorDia = banco.filter(r=>{
let dataLavagem = new Date(r.data)
return dataLavagem.getDate()===dia.getDate() && dataLavagem.getMonth()===dia.getMonth() && dataLavagem.getFullYear()===dia.getFullYear()
}).reduce((acc,r)=>acc+Number(r.valor),0)
valoresGrafico.push(valorDia)
}
if(chartFaturamento) chartFaturamento.destroy()
let ctx = document.getElementById("chartFaturamento").getContext("2d")
chartFaturamento = new Chart(ctx,{
type:'bar',
data:{labels:datasGrafico,datasets:[{label:'Faturamento R$',data:valoresGrafico,backgroundColor:'#2563eb'}]},
options:{responsive:true,plugins:{legend:{display:false}}}
})
}

/* ===================== EXPORTAÇÃO CSV ===================== */
function exportarCSV(){
if(banco.length===0){alert("Nenhum registro para exportar"); return}
let csv = "Placa,Nome,Telefone,TipoVeículo,TipoLavagem,Valor,Data\n"
banco.forEach(r=>{csv+=`${r.placa},${r.nome},${r.telefone},${r.tipoVeiculo},${r.tipoLavagem},${r.valor},${r.data}\n`})
let blob = new Blob([csv],{type:'text/csv'})
let url = URL.createObjectURL(blob)
let a=document.createElement('a')
a.href=url;a.download='lavagens.csv';a.click();URL.revokeObjectURL(url)
}

/* ===================== BACKUP LOCAL ===================== */
function backupLocal(){
let data = JSON.stringify(banco,null,2)
let blob = new Blob([data],{type:'application/json'})
let url = URL.createObjectURL(blob)
let a=document.createElement('a')
a.href=url;a.download='backup_lavagens.json';a.click();URL.revokeObjectURL(url)
alert("Backup baixado com sucesso!")
}

function carregarHistorico(){

let lista = document.getElementById("listaHistorico")

lista.innerHTML = ""

if(banco.length === 0){

lista.innerHTML = "Nenhuma lavagem registrada."

return

}

/* ordenar do mais recente para o mais antigo */

let registros = [...banco].sort((a,b)=> new Date(b.data) - new Date(a.data))

registros.forEach(r=>{

let data = new Date(r.data)

let numeroWhats = limparNumero(r.telefone)

let mensagem = `Olá ${r.nome}, obrigado por lavar seu veículo (${r.placa}) em nosso lava-jato!`

let linkWhats = `https://wa.me/55${numeroWhats}?text=${encodeURIComponent(mensagem)}`

lista.innerHTML += `

<div class="card">

<strong>${r.placa}</strong><br>

Cliente: ${r.nome}<br>

Veículo: ${r.tipoVeiculo}<br>

Lavagem: ${r.tipoLavagem}<br>

Valor: R$ ${r.valor}<br>

Data: ${data.toLocaleDateString()} ${data.toLocaleTimeString()}<br>

<br>

<a href="${linkWhats}" target="_blank">

<button>WhatsApp</button>

</a>

</div>

`

})

}

function gerarBancoTeste(){

const clientes = [

{nome:"Barbara", telefone:"81986163075"},
{nome:"Ruth", telefone:"81988751286"},
{nome:"Rafa", telefone:"81995328408"},
{nome:"Márcia", telefone:"81988130616"}

]

const placas = [
"QWE1234",
"ABC9087",
"JKL4567",
"XYZ3210",
"BRA2024",
"CAR9090",
"MOT7788",
"PIC4455"
]

const tiposVeiculo = ["passeio","utilitario","pickup","moto"]
const tiposLavagem = ["simples","completa"]

/* limpa banco antigo */

banco = []

for(let i=0;i<60;i++){

let cliente = clientes[Math.floor(Math.random()*clientes.length)]

let veiculo = tiposVeiculo[Math.floor(Math.random()*tiposVeiculo.length)]

let lavagem = tiposLavagem[Math.floor(Math.random()*tiposLavagem.length)]

let valor = tabelaPrecos[veiculo][lavagem]

let placa = placas[Math.floor(Math.random()*placas.length)]

let diasAtras = Math.floor(Math.random()*30)

let data = new Date()

data.setDate(data.getDate()-diasAtras)

let registro = {

placa:placa,
nome:cliente.nome,
telefone:cliente.telefone,
tipoVeiculo:veiculo,
tipoLavagem:lavagem,
valor:valor,
data:data.toISOString()

}

banco.push(registro)

}

localStorage.setItem("lavagens",JSON.stringify(banco))

alert("Banco de testes criado com sucesso!")

}

function analisarClientes(){

let hoje = new Date().toDateString()

let clientes = {}

let faturamentoHoje = 0

banco.forEach(r=>{

let data = new Date(r.data)

let nome = r.nome

if(!clientes[nome]){

clientes[nome]={

nome:r.nome,

telefone:r.telefone,

placa:r.placa,

lavagens:0,

ultima:data

}

}

clientes[nome].lavagens++

if(data > clientes[nome].ultima){

clientes[nome].ultima=data

}

if(data.toDateString() === hoje){

faturamentoHoje += Number(r.valor)

}

})

document.getElementById("faturamentoHojeTempoReal").innerText = faturamentoHoje.toFixed(2)

let hojeLista = document.getElementById("clientesHoje")
let vipLista = document.getElementById("clientesVIP")
let lista20 = document.getElementById("clientes20")
let lista30 = document.getElementById("clientes30")

hojeLista.innerHTML=""
vipLista.innerHTML=""
lista20.innerHTML=""
lista30.innerHTML=""

let agora = new Date()

Object.values(clientes).forEach(c=>{

let dias = (agora - new Date(c.ultima))/(1000*60*60*24)

let numero = limparNumero(c.telefone)

let msg = `Olá ${c.nome}, estamos esperando você para a próxima lavagem do seu veículo (${c.placa}).`

let link = `https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`

if(new Date(c.ultima).toDateString() === hoje){

hojeLista.innerHTML += `<div class="card">${c.nome} - ${c.placa}</div>`

}

if(c.lavagens >= 10){

vipLista.innerHTML += `<div class="card">${c.nome} (${c.lavagens} lavagens)</div>`

}

if(dias >= 20){

lista20.innerHTML += `<div class="card">${c.nome} (${Math.floor(dias)} dias) <a href="${link}" target="_blank"><button>WhatsApp</button></a></div>`

}

if(dias >= 30){

lista30.innerHTML += `<div class="card">${c.nome} (${Math.floor(dias)} dias) <a href="${link}" target="_blank"><button>WhatsApp</button></a></div>`

}

})

}

function chamarLista(listaID){

let elementos = document.getElementById(listaID).querySelectorAll("a")

if(elementos.length === 0){

alert("Nenhum cliente nessa lista")

return

}

elementos.forEach(link=>{

window.open(link.href)

})

}

function carregarPrecos(){

document.getElementById("passeioSimples").value = tabelaPrecos.passeio.simples
document.getElementById("passeioCompleta").value = tabelaPrecos.passeio.completa

document.getElementById("utilitarioSimples").value = tabelaPrecos.utilitario.simples
document.getElementById("utilitarioCompleta").value = tabelaPrecos.utilitario.completa

document.getElementById("pickupSimples").value = tabelaPrecos.pickup.simples
document.getElementById("pickupCompleta").value = tabelaPrecos.pickup.completa

document.getElementById("motoSimples").value = tabelaPrecos.moto.simples
document.getElementById("motoCompleta").value = tabelaPrecos.moto.completa

}

function salvarPrecos(){

tabelaPrecos = {

passeio:{
simples:Number(document.getElementById("passeioSimples").value),
completa:Number(document.getElementById("passeioCompleta").value)
},

utilitario:{
simples:Number(document.getElementById("utilitarioSimples").value),
completa:Number(document.getElementById("utilitarioCompleta").value)
},

pickup:{
simples:Number(document.getElementById("pickupSimples").value),
completa:Number(document.getElementById("pickupCompleta").value)
},

moto:{
simples:Number(document.getElementById("motoSimples").value),
completa:Number(document.getElementById("motoCompleta").value)
}

}

localStorage.setItem("precos",JSON.stringify(tabelaPrecos))

alert("Preços atualizados com sucesso!")

}

function gerarBancoTesteCompleto(){

const clientes = [

{nome:"Barbara", telefone:"81986163075"},
{nome:"Ruth", telefone:"81988751286"},
{nome:"Rafa", telefone:"81995328408"},
{nome:"Márcia", telefone:"81988130616"}

]

const placas = {
Barbara:"BAR1234",
Ruth:"RUT5678",
Rafa:"RAF9012",
Márcia:"MAR3456"
}

const tiposVeiculo = ["passeio","utilitario","pickup","moto"]
const tiposLavagem = ["simples","completa"]

banco = []

function criarRegistro(cliente,diasAtras){

let veiculo = tiposVeiculo[Math.floor(Math.random()*tiposVeiculo.length)]
let lavagem = tiposLavagem[Math.floor(Math.random()*tiposLavagem.length)]
let valor = tabelaPrecos[veiculo][lavagem]

let data = new Date()
data.setDate(data.getDate()-diasAtras)

return {

placa:placas[cliente.nome],
nome:cliente.nome,
telefone:cliente.telefone,
tipoVeiculo:veiculo,
tipoLavagem:lavagem,
valor:valor,
data:data.toISOString()

}

}

/* ===== Barbara (cliente VIP) ===== */

for(let i=0;i<15;i++){

banco.push(criarRegistro(clientes[0], i))

}

/* ===== Ruth (lavou hoje e ontem) ===== */

banco.push(criarRegistro(clientes[1],0))
banco.push(criarRegistro(clientes[1],1))
banco.push(criarRegistro(clientes[1],3))
banco.push(criarRegistro(clientes[1],5))

/* ===== Rafa (20 dias sem lavar) ===== */

banco.push(criarRegistro(clientes[2],21))
banco.push(criarRegistro(clientes[2],22))
banco.push(criarRegistro(clientes[2],25))

/* ===== Márcia (30 dias sem lavar) ===== */

banco.push(criarRegistro(clientes[3],31))
banco.push(criarRegistro(clientes[3],35))
banco.push(criarRegistro(clientes[3],40))

/* ===== registros extras para dashboard ===== */

for(let i=0;i<40;i++){

let cliente = clientes[Math.floor(Math.random()*clientes.length)]

let dias = Math.floor(Math.random()*30)

banco.push(criarRegistro(cliente,dias))

}

localStorage.setItem("lavagens",JSON.stringify(banco))

alert("Banco de testes completo criado!")

}

function chamarWhatsAppClientes(lista){

if(!lista || lista.length === 0){
alert("Nenhum cliente encontrado")
return
}

let mensagem = "Olá! Sentimos sua falta no lava-jato 🚗\n\nEstamos com a agenda aberta para lavagens hoje."

lista.forEach(cliente => {

let telefone = cliente.telefone.replace(/\D/g,"")

let url = "https://wa.me/55"+telefone+"?text="+encodeURIComponent(mensagem)

window.open(url,"_blank")

})

}

function chamarClientes20(){

let hoje = new Date()

let lista = banco.filter(reg => {

let data = new Date(reg.data)

let dias = (hoje - data) / (1000*60*60*24)

return dias > 20

})

chamarWhatsAppClientes(lista)

}

function chamarClientes30(){

let hoje = new Date()

let lista = banco.filter(reg => {

let data = new Date(reg.data)

let dias = (hoje - data) / (1000*60*60*24)

return dias > 30

})

chamarWhatsAppClientes(lista)

}
