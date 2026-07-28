const supabase = require("../supabase");


// CRIAR DEPÓSITO
async function criarDeposito(telegram_id, valor) {

    const { data: usuario, error } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_id", telegram_id)
        .single();


    if (error || !usuario) {
        throw new Error("Usuário não encontrado");
    }


    const { data, error: erroTransacao } = await supabase
        .from("transactions")
        .insert({

            user_id: usuario.id,
            telegram_id,
            tipo: "deposito",
            valor,
            status: "pendente"

        })
        .select()
        .single();


    if (erroTransacao) throw erroTransacao;


    return data;

}



// ADICIONAR SALDO
async function adicionarSaldo(telegram_id, valor) {


    const { data: usuario, error } = await supabase
        .from("users")
        .select("saldo")
        .eq("telegram_id", telegram_id)
        .single();


    if(error || !usuario){
        throw new Error("Usuário não encontrado");
    }


    const novoSaldo =
        Number(usuario.saldo) + Number(valor);



    const { error:updateError } = await supabase
        .from("users")
        .update({

            saldo: novoSaldo

        })
        .eq("telegram_id", telegram_id);



    if(updateError) throw updateError;


    return novoSaldo;

}




// CONSULTAR SALDO
async function consultarSaldo(telegram_id){


    const {data,error}=await supabase
    .from("users")
    .select("saldo")
    .eq("telegram_id",telegram_id)
    .single();



    if(error) throw error;


    return data;

}




// CRIAR SAQUE
async function criarSaque(telegram_id, valor){


    const {data:usuario,error}=await supabase
    .from("users")
    .select("id,saldo")
    .eq("telegram_id",telegram_id)
    .single();



    if(error || !usuario){
        throw new Error("Usuário não encontrado");
    }



    if(Number(usuario.saldo) < Number(valor)){
        throw new Error("Saldo insuficiente");
    }




    const {data,error:erroSaque}=await supabase
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



    if(erroSaque) throw erroSaque;


    return data;

}





module.exports = {

    criarDeposito,
    adicionarSaldo,
    consultarSaldo,
    criarSaque

};