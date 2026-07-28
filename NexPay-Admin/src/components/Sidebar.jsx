export default function Sidebar(){

    return (

        <aside style={{
            width:"240px",
            height:"100vh",
            background:"#090909",
            borderRight:"1px solid #222",
            padding:"25px",
            color:"#fff"
        }}>


            <h1 style={{
                color:"#a855f7",
                fontSize:"28px"
            }}>
                NexPay
            </h1>


            <p>📊 Dashboard</p>
            <p>💰 Depósitos</p>
            <p>💸 Saques</p>
            <p>👥 Usuários</p>
            <p>⚙️ Configurações</p>


        </aside>

    )

}