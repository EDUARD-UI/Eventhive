import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Edit,
  Mail,
  Calendar,
  Lock,
  Building,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalEditarUsuario from '../../components/componentsAdmin/ModalEditarUsuario.jsx';

export default function AdminUsuariosView({
  usuarios = [],
  onUpdateUsuario,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredUsers = useMemo(() => {
    return usuarios.filter((user) => {
      const matchSearch =
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organizacion?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRol = filtroRol === 'TODOS' || user.rol === filtroRol;

      return matchSearch && matchRol;
    });
  }, [usuarios, searchTerm, filtroRol]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleSaveUsuario = (userId, updates) => {
    onUpdateUsuario(userId, updates);
    setSelectedUser(null);
  };

  const getRoleBadgeVariant = (rol) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'danger';
      case 'MODERADOR':
        return 'primary';
      case 'REPRESENTANTE':
        return 'warning';
      case 'OPERADOR':
        return 'info';
      case 'CLIENTE':
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner Informativo sobre Roles del Dominio */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 shrink-0">
          <Shield className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-0.5">
            Directorio de Usuarios y Control de Autorización
          </span>
          Los roles del dominio corresponden estrictamente a <strong>ADMINISTRADOR</strong>, <strong>MODERADOR</strong>, <strong>REPRESENTANTE</strong>, <strong>OPERADOR</strong> y <strong>CLIENTE</strong>. Por seguridad y trazabilidad transaccional, se aplica <strong>desactivación lógica</strong> en lugar de borrado físico.
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o empresa..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={filtroRol}
            onChange={(e) => { setFiltroRol(e.target.value); setCurrentPage(1); }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TODOS">Todos los Roles</option>
            <option value="CLIENTE">Clientes</option>
            <option value="REPRESENTANTE">Representantes</option>
            <option value="OPERADOR">Operadores</option>
            <option value="MODERADOR">Moderadores</option>
            <option value="ADMINISTRADOR">Administradores</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Rol en Dominio</th>
                <th className="py-3.5 px-4">Organización Vinculada</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                          {user.nombre?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.nombre}</div>
                          <span className="text-[10px] text-slate-400">Registrado: {user.fechaRegistro}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {user.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getRoleBadgeVariant(user.rol)} size="xs">
                        {user.rol}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {user.organizacion ? (
                        <span className="font-medium text-slate-800">{user.organizacion}</span>
                      ) : (
                        <span className="text-slate-400 italic">Sin organización</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={user.activo ? 'success' : 'danger'} size="xs">
                        {user.activo ? 'Activo' : 'Bloqueado'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Editar Rol / Desactivación Lógica"
                      >
                        <Edit className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Modal de Edición de Usuario */}
      {selectedUser && (
        <ModalEditarUsuario
          usuario={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUsuario}
        />
      )}
    </div>
  );
}
