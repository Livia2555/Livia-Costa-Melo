import { Routes, Route } from 'react-router-dom';
import { Login } from '../Paginas/Login';
import { Estoque } from '../Paginas/Estoque';
import { Historico } from '../Paginas/Historico';



export function Rotas() {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/Estoque' element={<Estoque />} />
            <Route path='/Historico' element={<Historico />} />  
        </Routes >
    )
}