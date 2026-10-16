import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { CircleCheck, Info, LoaderCircle, TriangleAlert } from 'lucide-react';
import { cx } from '../utils/cx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background,color,box-shadow,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0 text-center';
const variants: Record<Variant, string> = {
  primary: 'bg-tide-600 text-white hover:bg-tide-700 shadow-sm',
  secondary: 'border border-abyss-800/20 bg-white text-abyss-800 hover:border-abyss-800/40 hover:bg-sand-50',
  ghost: 'text-abyss-800 hover:bg-abyss-800/5',
  dark: 'bg-abyss-800 text-sand-100 hover:bg-abyss-700',
  danger: 'border border-coral-600/40 bg-white text-coral-600 hover:bg-coral/10',
  light: 'bg-sand-100 text-abyss-900 hover:bg-white',
};
const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-[15px]',
  lg: 'min-h-12 px-6 py-3 text-base',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return cx(base, variants[variant], sizes[size], extra);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'tide' | 'sand' | 'coral' | 'dark' | 'outline'; className?: string }) {
  const tones = {
    neutral: 'bg-abyss-800/[0.07] text-abyss-800',
    tide: 'bg-tide-50 text-tide-700 ring-1 ring-tide-200',
    sand: 'bg-sand-200 text-ink-soft',
    coral: 'bg-coral/10 text-coral-600 ring-1 ring-coral/30',
    dark: 'bg-abyss-800 text-sand-100',
    outline: 'ring-1 ring-abyss-800/20 text-abyss-800',
  };
  return (
    <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, intro, id, align = 'left' }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; id?: string; align?: 'left' | 'center' }) {
  return (
    <div className={cx('mb-8 max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 id={id} className="text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-3 text-lg leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-abyss-900">
        {label}
        {required && <span className="ml-1 font-normal text-ink-muted">(obrigatório)</span>}
      </label>
      {children({ id, 'aria-describedby': [hintId, errId].filter(Boolean).join(' ') || undefined, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-coral-600">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export function Notice({ tone = 'info', title, children, className }: { tone?: 'info' | 'success' | 'warning'; title?: string; children: ReactNode; className?: string }) {
  const map = {
    info: { cls: 'bg-abyss-800/[0.05] border-abyss-800/15 text-abyss-900', Icon: Info, label: 'Informação' },
    success: { cls: 'bg-tide-50 border-tide-200 text-tide-700', Icon: CircleCheck, label: 'Sucesso' },
    warning: { cls: 'bg-coral/[0.08] border-coral/30 text-[#7A2E14]', Icon: TriangleAlert, label: 'Atenção' },
  }[tone];
  return (
    <div className={cx('flex gap-3 rounded-xl border p-4 text-sm leading-relaxed', map.cls, className)}>
      <map.Icon className="mt-0.5 h-5 w-5 shrink-0" aria-label={map.label} />
      <div>
        {title && <p className="mb-0.5 font-bold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-400 bg-sand-50 px-6 py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-tide-50 text-tide-600" aria-hidden>
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <div className="mt-1 max-w-md text-ink-soft">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className={cx('h-2.5 w-full overflow-hidden rounded-full bg-abyss-800/10', className)}
    >
      <div className="h-full rounded-full bg-gradient-to-r from-tide-500 to-tide-300 transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        {icon && <span className="text-tide-600" aria-hidden>{icon}</span>}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-abyss-900 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/** Lista de opções como "cartões" de rádio, acessível por teclado (setas) por ser um grupo de rádio nativo. */
export function RadioCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  columns = 3,
  error,
  hideLegend,
}: {
  name: string;
  legend: string;
  options: { value: T; label: ReactNode; description?: ReactNode; aside?: ReactNode; disabled?: boolean }[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
  error?: string;
  hideLegend?: boolean;
}) {
  const errId = useId();
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns];
  return (
    <fieldset aria-describedby={error ? errId : undefined}>
      <legend className={cx('mb-2 text-sm font-semibold text-abyss-900', hideLegend && 'sr-only')}>{legend}</legend>
      <div className={cx('grid gap-3', cols)}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={cx(
                'relative flex cursor-pointer gap-3 rounded-xl border bg-white p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tide-400',
                checked ? 'border-tide-500 bg-tide-50/60 ring-1 ring-tide-500' : 'border-sand-400 hover:border-abyss-800/40',
                o.disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
                className="mt-1 h-4 w-4 shrink-0 accent-tide-600"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <span className="font-semibold text-abyss-900">{o.label}</span>
                  {o.aside}
                </span>
                {o.description && <span className="mt-1 block text-sm text-ink-soft">{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errId} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-coral-600">
          <TriangleAlert className="h-4 w-4" aria-hidden />
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function Checkbox({ label, checked, onChange, description }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; description?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-1">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-tide-600" />
      <span>
        <span className="font-medium text-abyss-900">{label}</span>
        {description && <span className="block text-sm text-ink-soft">{description}</span>}
      </span>
    </label>
  );
}

export function PageHeader({ eyebrow, title, intro, actions }: { eyebrow?: string; title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {intro && <p className="mt-2 text-ink-soft">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
