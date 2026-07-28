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


        const payment_id = req.query.id;


        if(!payment_id){

            return res.sendStatus(200);

        }



        // Consulta pagamento no Mercado Pago

        const pagamento = await consultarPagamento(payment_id);



        if(pagamento.status === "approved"){


            const { data: transacao, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("payment_id", payment_id)
            .single();



            if(error) throw error;



            // Evita duplicar saldo

            if(transacao.status !== "aprovado"){



                await supabase
                .from("transactions")
                .update({

                    status:"aprovado"

                })
                .eq("payment_id", payment_id);



                await adicionarSaldo(

                    transacao.telegram_id,

                    transacao.valor

                );


            }


        }



        res.sendStatus(200);



    }catch(error){


        console.log(error.message);

        res.sendStatus(500);


    }


});