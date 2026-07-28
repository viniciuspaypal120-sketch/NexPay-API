const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();


const bot = new TelegramBot(
    process.env.TELEGRAM_TOKEN,
    {
        polling:true
    }
);


console.log("🤖 NexPay Telegram Bot iniciado!");


let aguardandoValor = {};



// START

bot.onText(/\/start/, async(msg)=>{

    const chatId = msg.chat.id;
    const nome = msg.from.first_name || "Usuário";


    const resposta = await fetch(
        "http://localhost:3000/telegram/cadastro",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                telegram_id:chatId,
                nome:nome
            })

        }
    );


    const dados = await resposta.json();


    console.log("Cadastro:",dados);



    bot.sendMessage(
        chatId,
`
💜 Bem-vindo à NexPay

Sua carteira digital.

Escolha uma opção:
`,
{
reply_markup:{
keyboard:[
["💰 Depositar"],
["👛 Meu saldo"],
["📜 Histórico"]
],
resize_keyboard:true
}
});

});





// SALDO

bot.onText(/👛 Meu saldo/, async(msg)=>{


const chatId = msg.chat.id;


const resposta = await fetch(
`http://localhost:3000/saldo/${chatId}`
);

const dados = await resposta.json();


bot.sendMessage(
chatId,
`
👛 Carteira NexPay

Saldo disponível:

💜 R$ ${Number(dados.saldo).toFixed(2)}
`
);


});





// DEPÓSITO

bot.onText(/💰 Depositar/, (msg)=>{


const chatId = msg.chat.id;


aguardandoValor[chatId] = true;


bot.sendMessage(
chatId,
`
💰 Depósito NexPay

Digite o valor:

Exemplo:
50
`
);


});





// RECEBER VALOR

bot.on("message", async(msg)=>{


const chatId = msg.chat.id;


if(!aguardandoValor[chatId]) return;


if(msg.text.startsWith("/")) return;



const valor = Number(msg.text);



if(isNaN(valor)){

return bot.sendMessage(
chatId,
"❌ Digite apenas números."
);

}



aguardandoValor[chatId] = false;



await fetch(
"http://localhost:3000/deposito",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

telegram_id:chatId,
valor:valor

})

});



bot.sendMessage(
chatId,
`
✅ Depósito criado

💜 Valor:
R$ ${valor.toFixed(2)}

⏳ Status:
Pendente
`
);


});





// HISTÓRICO

bot.onText(/📜 Histórico/, (msg)=>{


bot.sendMessage(
msg.chat.id,
`
📜 Histórico NexPay

Nenhuma transação encontrada.
`
);


});