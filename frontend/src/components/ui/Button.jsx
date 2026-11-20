export default function Button({ children, variant = 'primary', ...props }) {
  const styles = variant === 'primary'
    ? 'bg-[#FF6B1A] hover:bg-[#ff7d2e] text-white'
    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10';
  return (
    <button {...props} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition active:scale-[0.98] disabled:opacity-50 ${styles} ${props.className || ''}`}>
      {children}
    </button>
  );
}