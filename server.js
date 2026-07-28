const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./supabase");

const {
    criarDeposito,
    consultarSaldo,
    adicionarSaldo
} = require("./services/carteira");


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
// CRIAR DEPÓSITO
// ===============================

app.post("/deposito", async(req,res)=>{

    try{

        const {
            telegram_id,
            valor
        } = req.body;


        if(!telegram_id || !valor){

            return res.status(400).json({
                erro:"Informe telegram_id e valor"
            });

        }


        const deposito = await criarDeposito(
            telegram_id,
            valor
        );


        res.json({

            mensagem:"Depósito criado com sucesso",

            deposito

        });


    }catch(error){

        res.status(500).json({
            erro:error.message
        });

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
// ADMIN - DEPÓSITOS PENDENTES
// ===============================

app.get("/admin/depositos", async(req,res)=>{

    try{


        const {data,error}=await supabase
        .from("transactions")
        .select("*")
        .eq("tipo","deposito")
        .eq("status","pendente")
        .order("created_at",{ascending:false});


        if(error) throw error;


        res.json(data);


    }catch(error){

        res.status(500).json({
            erro:error.message
        });

    }

});





// ===============================
// ADMIN - APROVAR DEPÓSITO
// ===============================

app.post("/admin/aprovar/:id", async(req,res)=>{


    try{


        const id=req.params.id;



        const {data:transacao,error}=await supabase
        .from("transactions")
        .select("*")
        .eq("id",id)
        .single();



        if(error) throw error;



        await supabase
        .from("transactions")
        .update({

            status:"aprovado"

        })
        .eq("id",id);



        const novoSaldo = await adicionarSaldo(
            transacao.telegram_id,
            transacao.valor
        );



        res.json({

            mensagem:"Depósito aprovado com sucesso",

            valor:transacao.valor,

            novoSaldo

        });



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



        const {data:usuario}=await supabase
        .from("users")
        .select("*")
        .eq("telegram_id",telegram_id)
        .single();



        if(Number(usuario.saldo)<Number(valor)){

            return res.status(400).json({
                erro:"Saldo insuficiente"
            });

        }



        const {data,error}=await supabase
        .from("transactions")
        .insert({

            user_id:usuario.id,
            telegram_id,
            tipo:"saque",
            valor,
            status:"pendente"

        })
        .select()
        .single();



        if(error) throw error;



        res.json({

            mensagem:"Saque criado com sucesso",

            saque:data

        });



    }catch(error){

        res.status(500).json({
            erro:error.message
        });

    }


});





// ===============================
// ADMIN - SAQUES
// ===============================

app.get("/admin/saques", async(req,res)=>{


    const {data,error}=await supabase
    .from("transactions")
    .select("*")
    .eq("tipo","saque")
    .eq("status","pendente");


    if(error){

        return res.status(500).json({
            erro:error.message
        });

    }


    res.json(data);


});





// ===============================
// ADMIN - APROVAR SAQUE
// ===============================

app.post("/admin/aprovar-saque/:id", async(req,res)=>{


try{


const id=req.params.id;



const {data:saque}=await supabase
.from("transactions")
.select("*")
.eq("id",id)
.single();



await supabase
.from("transactions")
.update({

    status:"aprovado"

})
.eq("id",id);



const {data:usuario}=await supabase
.from("users")
.select("saldo")
.eq("telegram_id",saque.telegram_id)
.single();



const novoSaldo =
Number(usuario.saldo)-Number(saque.valor);



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

valor:saque.valor,

novoSaldo

});


}catch(error){

res.status(500).json({
erro:error.message
});

}


});




// ===============================
// HISTÓRICO
// ===============================

app.get("/historico/:telegram_id", async(req,res)=>{


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



if(error){

return res.status(500).json({
erro:error.message
});

}


res.json(data);


});





// ===============================
// CLIENTE LOVABLE
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




app.get("/usuario/historico/:telegram_id", async(req,res)=>{


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



if(error){

return res.status(500).json({
erro:error.message
});

}



res.json(data);


});





// ===============================
// SERVIDOR
// ===============================


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{

console.log(
`NexPay API rodando na porta ${PORT}`
);

});