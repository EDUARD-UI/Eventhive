import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Building2,
  Phone,
  User,
  Eye,
  Mail,
  Edit,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';
import ModalDetalleUsuarioAdmin from '../../components/componentsAdmin/ModalDetalleUsuarioAdmin.jsx';
import ModalEnviarCorreo from '../../components/Shared/ModalEnviarCorreo.jsx';
import adminService from '../../features/admin/services/adminService.js';

export default function AdminUsuariosView({
  usuarios: initialUsuarios = [],
  onUpdateUsuario,
}) {
  const [usuariosList, setUsuariosList] = useState(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(initialUsuarios.length || 0);
  const [loading, setLoading] = useState(false);

  // Modales a la derecha
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState(null);
  const [mailModal, setMailModal] = useState({
    isOpen: false,
    email: '',
    name: '',
    subject: '',
  });

  // Carga reactiva de usuarios desde endpoint paginado GET /api/usuarios o búsqueda
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      if (searchTerm.trim()) {
        const res = await adminService.buscarUsuarios({
          nombre: searchTerm.trim(),
          page: currentPage - 1,
          size: pageSize,
        });
        if (res.success) {
          setUsuariosList(res.data);
          setTotalItems(res.total);
        }
      } else {
        const res = await adminService.getUsuarios({
          page: currentPage - 1,
          size: pageSize,
        });
        if (res.success) {
          setUsuariosList(res.data);
          setTotalItems(res.total);
        }
      }
    } catch (err) {
      console.warn('Error al cargar lista paginada de usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    if (initialUsuarios && initialUsuarios.length > 0 && !searchTerm && filtroRol === 'TODOS') {
      setUsuariosList(initialUsuarios);
      setTotalItems(initialUsuarios.length);
    }
  }, [initialUsuarios]);

  // Filtrado reactivo por rol
  const filteredUsers = usuariosList.filter((user) => {
    const rol = (user.rolNombre || user.rol || '').toUpperCase();
    if (filtroRol !== 'TODOS' && rol !== filtroRol) return false;
    return true;
  });

  const getRoleBadgeVariant = (rol) => {
    const r = (rol || '').toUpperCase();
    switch (r) {
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

  const handleSaveUser = async (updatedData) => {
    if (onUpdateUsuario) {
      await onUpdateUsuario(updatedData);
    } else {
      await adminService.updateUsuario(updatedData.id, updatedData);
    }
    await fetchUsuarios();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial */}
      <AdminInfoAlert
        id="usuarios"
        title="Directorio Central de Usuarios"
        description="Consulte la lista paginada de cuentas registradas en Eventhive, su rol asignado en la plataforma y la organización a la que están vinculados. Puede ver el detalle de cada usuario, editar sus permisos o enviarle una comunicación vía correo en el panel lateral derecho."
      />

      {/* Encabezado y Barra de Filtros */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Directorio de Cuentas de Usuario</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total registrado: <strong>{totalItems}</strong> cuentas en la base de datos
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Buscar por nombre de usuario..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Filtro por Rol */}
          <select
            value={filtroRol}
            onChange={(e) => {
              setFiltroRol(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="TODOS">Todos los Roles</option>
            <option value="CLIENTE">Clientes</option>
            <option value="REPRESENTANTE">Representantes</option>
            <option value="OPERADOR">Operadores</option>
            <option value="MODERADOR">Moderadores</option>
            <option value="MARKETING">Marketing</option>
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
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Nombre de Usuario</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4 text-center">Rol del Usuario</th>
                <th className="py-3.5 px-4">Organización Vinculada</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Cargando directorio de usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios con los criterios especificados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const rolDisplay = user.rolNombre || user.rol || 'CLIENTE';
                  const orgName =
                    typeof user.organizacion === 'object' && user.organizacion !== null
                      ? user.organizacion.razonSocial || user.organizacion.nombre
                      : typeof user.organizacion === 'string' && user.organizacion.trim()
                      ? user.organizacion
                      : null;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-400 text-[11px]">
                        #{user.id}
                      </td>

                      {/* Nombre de Usuario */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                            {user.nombre?.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-slate-900">{user.nombre}</span>
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td className="py-4 px-4 text-slate-600">
                        {user.telefono ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.telefono}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Rol del Usuario */}
                      <td className="py-4 px-4 text-center">
                        <Badge variant={getRoleBadgeVariant(rolDisplay)} size="xs">
                          {rolDisplay}
                        </Badge>
                      </td>

                      {/* Organización Vinculada */}
                      <td className="py-4 px-4">
                        {orgName ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-semibold">{orgName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium italic">
                            Sin organización
                          </span>
                        )}
                      </td>

                      {/* Acciones individuales (Ver detalle a la derecha y Correo individual) */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForDrawer(user)}
                            className="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all active:scale-95"
                            title="Ver detalle y editar usuario"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Detalle</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setMailModal({
                                isOpen: true,
                                email: user.correo || user.email || '',
                                name: user.nombre || '',
                                subject: `Comunicación para ${user.nombre}`,
                              })
                            }
                            className="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all active:scale-95"
                            title="Enviar correo individual a este usuario"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Correo</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Modal Drawer a la Derecha para Detalle y Edición de Usuario */}
      {selectedUserForDrawer && (
        <ModalDetalleUsuarioAdmin
          usuario={selectedUserForDrawer}
          onClose={() => setSelectedUserForDrawer(null)}
          onSave={handleSaveUser}
          onOpenSendMail={(mailData) => {
            setMailModal({
              isOpen: true,
              email: mailData.email,
              name: mailData.name,
              subject: `Comunicación para ${mailData.name}`,
            });
          }}
        />
      )}

      {/* Modal Drawer a la Derecha para Enviar Correo Individual */}
      <ModalEnviarCorreo
        isOpen={mailModal.isOpen}
        onClose={() => setMailModal((prev) => ({ ...prev, isOpen: false }))}
        initialEmail={mailModal.email}
        initialName={mailModal.name}
        defaultSubject={mailModal.subject}
        title="Enviar Correo al Usuario"
        subtitle="Comunicación individual directa desde el panel de administración"
      />
    </div>
  );
}
