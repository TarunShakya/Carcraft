export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#111F3A] border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}