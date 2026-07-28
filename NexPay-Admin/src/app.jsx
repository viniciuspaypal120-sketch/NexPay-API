import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import "./app.css";


export function App(){

return (

<div style={{
    display:"flex"
}}>

<Sidebar />

<main style={{
    flex:1
}}>

<Dashboard />

</main>


</div>

)

}