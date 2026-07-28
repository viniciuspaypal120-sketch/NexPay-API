const { MercadoPagoConfig, Order } = require("mercadopago");
const crypto = require("crypto");
require("dotenv").config();


const client = new MercadoPagoConfig({

    accessToken: process.env.MERCADOPAGO_TOKEN

});


const order = new Order(client);



async function criarPix(valor) {

    try {


        const body = {

            type: "online",

            processing_mode: "automatic",

            total_amount: Number(valor).toFixed(2),


            external_reference: "NEXPAY-" + Date.now(),


            payer: {

                email: "test_user_123456@testuser.com",

                first_name: "Cliente"

            },


            transactions: {

                payments: [

                    {

                        amount: Number(valor).toFixed(2),

                        payment_method: {

                            id: "pix",

                            type: "bank_transfer"

                        }

                    }

                ]

            }


        };


        const resposta = await order.create({

            body,

            requestOptions: {

                idempotencyKey: crypto.randomUUID()

            }

        });


        console.log("===== PIX CRIADO =====");

        console.log(JSON.stringify(resposta, null, 2));


        return resposta;



    } catch(error) {


        console.log("===== ERRO MERCADO PAGO =====");


        console.log(
            error.cause ||
            error.response?.data ||
            error.message
        );


        throw error;


    }

}



module.exports = {

    criarPix

};