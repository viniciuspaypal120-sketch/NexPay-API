const axios = require("axios");
require("dotenv").config();


console.log(
    "TOKEN EXISTE:",
    !!process.env.PAGBANK_TOKEN
);


const pagbank = axios.create({

    // Sandbox = testes
    baseURL: "https://sandbox.api.pagseguro.com",

    headers: {

        Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,

        "Content-Type": "application/json",

        Accept: "application/json"

    }

});



async function criarPix(valor){


    try {


        const resposta = await pagbank.post(
            "/orders",
            {

                reference_id:
                "NEXPAY-" + Date.now(),


                customer: {

                    name: "Cliente NexPay",

                    email: "cliente@nexpay.com"

                },


                items: [

                    {

                        name: "Depósito NexPay",

                        quantity: 1,

                        unit_amount:
                        Math.round(valor * 100)

                    }

                ],


                qr_codes: [

                    {

                        amount: {

                            value:
                            Math.round(valor * 100)

                        }

                    }

                ]

            }

        );



        console.log(
            "PIX CRIADO:",
            resposta.data
        );


        return resposta.data;



    } catch(error){


        console.log("===== ERRO PAGBANK =====");


        console.log(
            "STATUS:",
            error.response?.status
        );


        console.log(
            "DATA:",
            JSON.stringify(
                error.response?.data
            )
        );


        console.log(
            "MESSAGE:",
            error.message
        );


        throw error;


    }


}



module.exports = {

    criarPix

};