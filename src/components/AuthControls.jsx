export function TextField({
  autoComplete,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-[rgba(255,255,255,0.7)]">
        {label}
      </span>
      <input
        autoComplete={autoComplete}
        className="h-12 w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 text-sm text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(245,166,35,0.5)]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

export function SelectField({ children, label, onChange, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-[rgba(255,255,255,0.7)]">
        {label}
      </span>
      <select
        className="h-12 w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-[#111114] px-4 text-sm text-white outline-none transition focus:border-[rgba(245,166,35,0.5)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

export function PasswordField({
  label,
  onChange,
  placeholder = "Enter your password",
  show,
  toggleShow,
  value,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-[rgba(255,255,255,0.7)]">
        {label}
      </span>
      <span className="relative block">
        <input
          autoComplete="current-password"
          className="h-12 w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(245,166,35,0.5)]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={show ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[rgba(255,255,255,0.5)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
          onClick={toggleShow}
          type="button"
        >
          {show ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}

export function GoldButton({ children, disabled, onClick }) {
  return (
    <button
      className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-4 text-sm font-semibold text-[#050508] shadow-[0_10px_30px_rgba(245,166,35,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#050508]/30 border-t-[#050508]" />
  );
}

export function ErrorMessage({ children }) {
  if (!children) {
    return null;
  }

  return (
    <p className="rounded-md border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.1)] px-3 py-2 text-center text-xs text-[#ff8a80]">
      {children}
    </p>
  );
}
