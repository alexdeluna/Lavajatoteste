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
