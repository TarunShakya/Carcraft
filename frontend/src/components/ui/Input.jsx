export default function Input({ label, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-[#94A3B8] mb-1.5">{label}</label>}
      <input {...props}
        className="w-full bg-[#0A1628] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 placeholder:text-white/30" />
    </div>
  );
}