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
// TESTE
// ===============================

app.get("/", (req,res)=>{

res.json({

nome:"NexPay API",

status:"online"

});

});




// ===============================
// CRIAR PIX
// ===============================

app.post("/pix/criar", async(req,res)=>{

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



const pagamento = await criarPix(
valor,
telegram_id
);



const deposito = await criarDeposito(
telegram_id,
valor
);



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

deposito_id: deposito.id,

payment_id: pagamento.id,

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

});






// ===============================
// CONSULTAR PAGAMENTO MP
// ===============================

app.get("/pagamento/:id", async(req,res)=>{

try{


const pagamento =
await consultarPagamento(
req.params.id
);



res.json(pagamento);



}catch(error){


res.status(500).json({

erro:error.message

});


}


});






// ===============================
// WEBHOOK MERCADO PAGO
// ===============================


app.post("/webhook/mercadopago", async(req,res)=>{


try{


const {

type,

data

}=req.body;



if(type !== "payment"){

return res.sendStatus(200);

}



const pagamento =
await consultarPagamento(
data.id
);



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




if(transacao.status === "aprovado"){

return res.sendStatus(200);

}




await supabase
.from("transactions")
.update({

status:"aprovado"

})
.eq(
"id",
transacao.id
);




await adicionarSaldo(

telegram_id,

pagamento.transaction_amount

);



console.log(
"Pagamento aprovado",
telegram_id
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


const saldo =
await consultarSaldo(
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
// USUARIO
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







// ===============================
// HISTÓRICO
// ===============================


app.get("/historico/:telegram_id", async(req,res)=>{


try{


const {data,error}=await supabase
.from("transactions")
.select("*")
.eq(
"telegram_id",
req.params.telegram_id
)
.order(
"created_at",
{
ascending:false
}
);



if(error) throw error;



res.json(data);



}catch(error){


res.status(500).json({

erro:error.message

});


}


});






// ===============================
// CRIAR SAQUE
// ===============================


app.post("/saque", async(req,res)=>{


try{


const {

telegram_id,

valor

}=req.body;



const saque =
await criarSaque(
telegram_id,
valor
);



res.json({

mensagem:"Saque criado",

saque

});



}catch(error){


res.status(500).json({

erro:error.message

});


}


});







// ===============================
// ADMIN SAQUES
// ===============================


app.get("/admin/saques", async(req,res)=>{


const {data,error}=await supabase
.from("transactions")
.select("*")
.eq(
"tipo",
"saque"
)
.eq(
"status",
"pendente"
);



if(error){

return res.status(500).json({

erro:error.message

});

}



res.json(data);



});







// ===============================
// APROVAR SAQUE
// ===============================


app.post("/admin/aprovar-saque/:id", async(req,res)=>{


try{


const {

data:saque

}=await supabase
.from("transactions")
.select("*")
.eq(
"id",
req.params.id
)
.single();



await supabase
.from("transactions")
.update({

status:"aprovado"

})
.eq(
"id",
req.params.id
);



const {data:usuario}=await supabase
.from("users")
.select("saldo")
.eq(
"telegram_id",
saque.telegram_id
)
.single();



const novoSaldo =
Number(usuario.saldo)
-
Number(saque.valor);



await supabase
.from("users")
.update({

saldo:novoSaldo

})
.eq(
"telegram_id",
saque.telegram_id
);



res.json({

mensagem:"Saque aprovado",

novoSaldo

});



}catch(error){


res.status(500).json({

erro:error.message

});


}


});







// ===============================
// SERVIDOR
// ===============================


const PORT =
process.env.PORT || 3000;



app.listen(PORT,()=>{


console.log(
`NexPay API rodando na porta ${PORT}`
);


});