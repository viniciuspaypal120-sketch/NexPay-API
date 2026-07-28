const { MercadoPagoConfig, Payment } = require("mercadopago");


// Configuração Mercado Pago
const client = new MercadoPagoConfig({

    accessToken: process.env.MP_ACCESS_TOKEN

});


const payment = new Payment(client);





// CRIAR PIX
async function criarPix(valor, telegram_id){


    const pagamento = await payment.create({

        body:{


            transaction_amount: Number(valor),


            description:
            "Depósito NexPay",



            payment_method_id:
            "pix",



            payer:{


                email:
                `${telegram_id}@nexpay.com`


            },


            metadata:{


                telegram_id


            }


        }

    });



    return pagamento;


}






// CONSULTAR PAGAMENTO
async function consultarPagamento(id){


    const pagamento = await payment.get({

        id

    });


    return pagamento;


}





module.exports = {


    criarPix,

    consultarPagamento


};