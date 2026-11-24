import { useCallback, useEffect, useState } from 'react';
import { api, normalizarEstadoTorneo } from '@services/api';
import Breadcrumb from '@components/Breadcrumb';
import { useToast } from '@components/useToast';

const EMPTY={nombre:'',juegoId:'',modalidad:'Eliminación directa',cupoMaximo:8,fechaInicio:'',fechaCierreInscripcion:'',estado:'ABIERTO',descripcion:'',reglas:''};
const fromApi=t=>({...t,estado:normalizarEstadoTorneo(t.estado).toUpperCase().replace(' ','_')});

export default function TournamentManagementPage(){
  const [torneos,setTorneos]=useState([]);const [juegos,setJuegos]=useState([]);const [form,setForm]=useState(EMPTY);const [editingId,setEditingId]=useState(null);const [saving,setSaving]=useState(false);
  const {showToast}=useToast();
  const load=useCallback(()=>{
    Promise.all([api.tournaments(),api.games()])
      .then(([tournaments,games])=>{setTorneos(tournaments.map(fromApi));setJuegos(games);})
      .catch(error=>showToast(`No se pudo cargar la información: ${error.message}`,'error'));
  },[showToast]);
  useEffect(()=>{load();},[load]);
  const update=(event)=>setForm(current=>({...current,[event.target.name]:event.target.value}));
  const reset=()=>{setForm(EMPTY);setEditingId(null);};
  const submit=async(event)=>{
    event.preventDefault();setSaving(true);
    const payload={...form,juegoId:Number(form.juegoId),cupoMaximo:Number(form.cupoMaximo)};
    try{const saved=editingId?await api.updateTournament(editingId,payload):await api.createTournament(payload);
      const value=fromApi(saved);setTorneos(current=>editingId?current.map(t=>t.id===editingId?value:t):[...current,value]);reset();showToast('Torneo guardado en el servidor.','exito');}
    catch(error){showToast(error.message,'error');}finally{setSaving(false);}
  };
  const edit=(torneo)=>{setEditingId(torneo.id);setForm({...torneo,juegoId:String(torneo.juegoId),cupoMaximo:String(torneo.cupoMaximo)});window.scrollTo({top:0,behavior:'smooth'});};
  const remove=async(torneo)=>{
    if(!window.confirm(`¿Eliminar el torneo “${torneo.nombre}”?`))return;
    try{await api.deleteTournament(torneo.id);setTorneos(current=>current.filter(t=>t.id!==torneo.id));showToast('Torneo eliminado.','info');}
    catch(error){showToast(error.message,'error');}
  };
  return <div className="container py-4">
    <Breadcrumb items={[{label:'Inicio',to:'/'},{label:'Torneos',to:'/torneos'},{label:'Administración'}]} />
    <section className="seccion"><h1 className="seccion__titulo">Administración de torneos</h1>
      <p className="seccion__subtitulo">Los cambios se guardan en la API. La fecha de cierre debe ser anterior o igual al inicio.</p>
      <form className="card p-3 p-md-4 mb-4" onSubmit={submit}>
        <h2 className="h5">{editingId?'Editar torneo':'Crear torneo'}</h2>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label" htmlFor="t-name">Nombre</label><input id="t-name" className="form-control" name="nombre" required minLength="3" maxLength="100" value={form.nombre} onChange={update}/></div>
          <div className="col-md-6"><label className="form-label" htmlFor="t-game">Juego</label><select id="t-game" className="form-select" name="juegoId" required value={form.juegoId} onChange={update}><option value="">Selecciona un juego</option>{juegos.map(game=><option key={game.id} value={game.id}>{game.nombre}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label" htmlFor="t-format">Modalidad</label><input id="t-format" className="form-control" name="modalidad" required maxLength="60" value={form.modalidad} onChange={update}/></div>
          <div className="col-md-2"><label className="form-label" htmlFor="t-slots">Cupo</label><input id="t-slots" className="form-control" type="number" name="cupoMaximo" min="1" max="512" required value={form.cupoMaximo} onChange={update}/></div>
          <div className="col-md-3"><label className="form-label" htmlFor="t-start">Fecha inicio</label><input id="t-start" className="form-control" type="date" name="fechaInicio" required value={form.fechaInicio} onChange={update}/></div>
          <div className="col-md-3"><label className="form-label" htmlFor="t-close">Cierre inscripción</label><input id="t-close" className="form-control" type="date" name="fechaCierreInscripcion" required value={form.fechaCierreInscripcion} onChange={update}/></div>
          <div className="col-md-4"><label className="form-label" htmlFor="t-status">Estado</label><select id="t-status" className="form-select" name="estado" value={form.estado} onChange={update}><option value="ABIERTO">Abierto</option><option value="EN_CURSO">En curso</option><option value="FINALIZADO">Finalizado</option><option value="CANCELADO">Cancelado</option></select></div>
          <div className="col-md-8"><label className="form-label" htmlFor="t-description">Descripción</label><input id="t-description" className="form-control" name="descripcion" maxLength="2000" value={form.descripcion||''} onChange={update}/></div>
          <div className="col-12"><label className="form-label" htmlFor="t-rules">Reglas</label><textarea id="t-rules" className="form-control" name="reglas" rows="2" maxLength="4000" value={form.reglas||''} onChange={update}/></div>
        </div>
        <div className="d-flex gap-2 mt-3"><button className="btn btn-primary" disabled={saving}>{saving?'Guardando…':editingId?'Guardar cambios':'Crear torneo'}</button>{editingId&&<button type="button" className="btn btn-outline-secondary" onClick={reset}>Cancelar edición</button>}</div>
      </form>
      <div className="table-responsive"><table className="table table-striped align-middle"><thead><tr><th>Torneo</th><th>Inicio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        {torneos.map(t=><tr key={t.id}><td>{t.nombre}</td><td>{t.fechaInicio}</td><td>{t.estado}</td><td className="d-flex gap-2"><button className="btn btn-sm btn-outline-secondary" onClick={()=>edit(t)}>Editar</button><button className="btn btn-sm btn-outline-danger" onClick={()=>remove(t)}>Eliminar</button></td></tr>)}
      </tbody></table></div>
    </section>
  </div>;
}
