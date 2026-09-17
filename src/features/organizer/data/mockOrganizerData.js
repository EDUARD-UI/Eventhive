import {
  FiCalendar,
  FiCreditCard,
  FiGrid,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

export const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: FiGrid },
  { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
  { id: 'asistentes', label: 'Asistentes', icon: FiUsers },
  { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
  { id: 'perfil', label: 'Mi perfil', icon: FiUser },
  { id: 'actividades', label: 'Actividades Recientes', icon: FiTrendingUp },
];

export const chartData = [
  { label: 'Jazz', value: 70 },
  { label: 'Sabores', value: 100 },
  { label: 'Feria', value: 52 },
  { label: 'Ritmo', value: 84 },
  { label: 'Cine', value: 38 },
  { label: 'Cátedra', value: 60 },
];

export const events = [
  { name: 'Festival Cartagena Jazz', date: '23 ago', status: 'Activo', tone: 'active', sold: '1.204', capacity: '1.500', action: 'Editar' },
  { name: 'Noche de Sabores', date: '29 ago', status: 'Activo', tone: 'active', sold: '800', capacity: '900', action: 'Editar' },
  { name: 'Cátedra de Historia', date: '9 sep', status: 'Borrador', tone: 'draft', sold: '—', capacity: '', action: 'Editar' },
  { name: 'Concierto de Verano', date: '2 jul', status: 'Finalizado', tone: 'finished', sold: '2.100', capacity: '2.100', action: 'Ver' },
];

export const organizerEvents = [
  { id: 1, category: 'Deportivo', title: 'Vóley Playa Bocagrande', date: '7 sep', time: '8:00 AM', location: 'Playas de Bocagrande', price: 0, color: 'green' },
  { id: 2, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
  { id: 3, category: 'Académico', title: 'Cátedra Historia Colonial', date: '9 sep', time: '5:00 PM', location: 'U. de Cartagena', price: 0, color: 'blue' },
  { id: 4, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
  { id: 5, category: 'Deportivo', title: 'Vóley Playa Bocagrande', date: '7 sep', time: '8:00 AM', location: 'Playas de Bocagrande', price: 0, color: 'green' },
  { id: 6, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
  { id: 7, category: 'Académico', title: 'Cátedra Historia Colonial', date: '9 sep', time: '5:00 PM', location: 'U. de Cartagena', price: 0, color: 'blue' },
  { id: 8, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
];
