export function formatPrice(value) {
  if (!value) return 'Gratis';
  return `$${value.toLocaleString('es-CO')}`;
}

export function getCategoryGradient(category = '') {
  const cat = (category || '').toLowerCase();
  if (cat.includes('músic') || cat.includes('conciert')) {
    return 'bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-950';
  }
  if (cat.includes('arte') || cat.includes('cultur') || cat.includes('teatr')) {
    return 'bg-gradient-to-br from-purple-800 via-pink-700 to-rose-950';
  }
  if (cat.includes('deport') || cat.includes('fit') || cat.includes('marat')) {
    return 'bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-950';
  }
  if (cat.includes('gastro') || cat.includes('comida') || cat.includes('beb') || cat.includes('rest')) {
    return 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-950';
  }
  if (cat.includes('negocio') || cat.includes('emprend') || cat.includes('tecnol')) {
    return 'bg-gradient-to-br from-blue-700 via-cyan-700 to-slate-950';
  }
  if (cat.includes('educa') || cat.includes('tall') || cat.includes('acad')) {
    return 'bg-gradient-to-br from-rose-700 via-red-700 to-slate-950';
  }
  if (cat.includes('festiv') || cat.includes('social') || cat.includes('comunid')) {
    return 'bg-gradient-to-br from-violet-700 via-fuchsia-700 to-indigo-950';
  }
  return 'bg-gradient-to-br from-[#0a1838] via-[#152e69] to-[#007bff]';
}
