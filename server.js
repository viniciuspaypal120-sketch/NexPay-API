const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./supabase");


const {
    criarDeposito,
    consultarSaldo,
    adicionarSaldo,
    criarSaque
} = require("./services/carteira");


const {
    criarPix,
    consultarPagamento
} = require("./services/mercadopago");



const app = express();


app.use(cors());
app.use(express.json());




// ===============================
// TESTE API
// ===============================

app.get("/", (req,res)=>{

    res.json({

        nome:"NexPay API",
        status:"online"

    });

});





// ===============================
// CRIAR PIX AUTOMATICO
// ===============================

app.post("/pix/criar", async(req,res)=>{

// ===============================
// WEBHOOK MERCADO PAGO
// ===============================

app.post("/webhook/mercadopago", async(req,res)=>{


try{


const {

type,
data

}=req.body;



// ignora notificações que não são pagamento

if(type !== "payment"){

return res.sendStatus(200);

}




const pagamento = await consultarPagamento(
    data.id
);




// só continua se estiver aprovado

if(pagamento.status !== "approved"){

return res.sendStatus(200);

}




const telegram_id =
pagamento.metadata.telegram_id;




const {data:transacao,error}=await supabase
.from("transactions")
.select("*")
.eq(
"payment_id",
pagamento.id
)
.single();



if(error || !transacao){

return res.sendStatus(200);

}




// evita adicionar saldo duas vezes

if(transacao.status === "aprovado"){

return res.sendStatus(200);

}





// atualiza depósito

await supabase
.from("transactions")
.update({

status:"aprovado"

})
.eq(
"id",
transacao.id
);





// adiciona saldo

const novoSaldo = await adicionarSaldo(

telegram_id,

pagamento.transaction_amount

);





console.log(
"Pagamento aprovado:",
telegram_id,
pagamento.transaction_amount
);




res.sendStatus(200);



}catch(error){


console.log(error);


res.sendStatus(500);


}



});





// ===============================
// SALDO
// ===============================


app.get("/saldo/:telegram_id", async(req,res)=>{


try{


const saldo = await consultarSaldo(

req.params.telegram_id

);



res.json(saldo);



}catch(error){


res.status(500).json({

erro:error.message

});


}


});





// ===============================
// USUÁRIO
// ===============================


app.get("/usuario/:telegram_id", async(req,res)=>{


const {data,error}=await supabase
.from("users")
.select("*")
.eq(
"telegram_id",
req.params.telegram_id
)
.single();



if(error){

return res.status(500).json({

erro:error.message

});

}



res.json(data);



});

try{


const {
    telegram_id,
    valor
}=req.body;



if(!telegram_id || !valor){

return res.status(400).json({

erro:"Informe telegram_id e valor"

});

}




// cria pagamento Mercado Pago

const pagamento = await criarPix(
    valor,
    telegram_id
);




// cria transação pendente

const deposito = await criarDeposito(
    telegram_id,
    valor
);




// salva id do pagamento

await supabase
.from("transactions")
.update({

payment_id: pagamento.id

})
.eq(
"id",
deposito.id
);



res.json({

mensagem:"PIX criado com sucesso",

deposito_id:deposito.id,

payment_id:pagamento.id,


qr_code:
pagamento.point_of_interaction
.transaction_data
.qr_code,


copia_e_cola:
pagamento.point_of_interaction
.transaction_data
.qr_code


});



}catch(error){

console.log(error);


res.status(500).json({

erro:error.message

});


}


});// ===============================
// SERVIDOR
// ===============================

const PORT = process.env.PORT || 3000;


app.listen(PORT, ()=>{

    console.log(
        `NexPay API rodando na porta ${PORT}`
    );

});