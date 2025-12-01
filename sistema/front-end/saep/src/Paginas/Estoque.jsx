import { TabelaEstoque } from '../Componentes/TabelaEstoque';
import { Navbar } from '../Componentes/NavBar';


export function Estoque() {
  return (
    <div>
      <Navbar/>
      <TabelaEstoque/>
    </div>
  );
}