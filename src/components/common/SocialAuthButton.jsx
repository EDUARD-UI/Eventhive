import { FcGoogle } from 'react-icons/fc';

export default function SocialAuthButton({
  onClick,
  provider = 'google',
  text = 'Continuar con Google',
  disabled = false,
  loading = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-borderc bg-white text-ink text-sm font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {provider === 'google' && <FcGoogle size={20} className="shrink-0" />}
      <span>{loading ? 'Conectando...' : text}</span>
    </button>
  );
}
