import { useEffect, useState } from "preact/hooks";
import api from "../services/api";


export default function Dashboard(){

    const [depositos,setDepositos] = useState([]);
    const [saques,setSaques] = useState([]);


    async function carregar(){

        const dep = await api.get("/admin/depositos");
        const sac = await api.get("/admin/saques");

        setDepositos(dep.data);
        setSaques(sac.data);

    }


    useEffect(()=>{

        carregar();

    },[]);



    async function aprovarDeposito(id){

        await api.post(`/admin/aprovar/${id}`);

        carregar();

    }



    async function aprovarSaque(id){

        await api.post(`/admin/aprovar-saque/${id}`);

        carregar();

    }



    return (

        <div style={{
            background:"#050505",
            minHeight:"100vh",
            color:"#fff",
            padding:"30px"
        }}>


            <h1 style={{
                color:"#a855f7"
            }}>
                NexPay Admin
            </h1>



            <h2>
                ➕ Depósitos pendentes: {depositos.length}
            </h2>

            <h2>
                💸 Saques pendentes: {saques.length}
            </h2>



            <hr/>


            <h2>Depósitos</h2>

            {
                depositos.map((d)=>(

                    <div style={{
                        background:"#111",
                        padding:"20px",
                        margin:"10px 0",
                        borderRadius:"12px"
                    }}>

                        <b>Usuário:</b> {d.telegram_id}
                        <br/>

                        <b>Valor:</b> R$ {d.valor}
                        <br/>

                        <b>Status:</b> {d.status}

                        <br/><br/>

                        <button
                        onClick={()=>aprovarDeposito(d.id)}
                        style={{
                            background:"#a855f7",
                            color:"#fff",
                            border:"none",
                            padding:"10px 20px",
                            borderRadius:"8px",
                            cursor:"pointer"
                        }}
                        >
                            ✅ Aprovar
                        </button>


                    </div>

                ))
            }





            <h2>Saques</h2>


            {
                saques.map((s)=>(

                    <div style={{
                        background:"#111",
                        padding:"20px",
                        margin:"10px 0",
                        borderRadius:"12px"
                    }}>


                        <b>Usuário:</b> {s.telegram_id}

                        <br/>

                        <b>Valor:</b> R$ {s.valor}

                        <br/>

                        <b>Status:</b> {s.status}


                        <br/><br/>


                        <button
                        onClick={()=>aprovarSaque(s.id)}
                        style={{
                            background:"#a855f7",
                            color:"#fff",
                            border:"none",
                            padding:"10px 20px",
                            borderRadius:"8px",
                            cursor:"pointer"
                        }}
                        >
                            💸 Aprovar saque
                        </button>


                    </div>

                ))
            }


        </div>

    );

}