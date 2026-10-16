import type { Modality, PlanId, ProductCategory } from '../domain/types';
import { cx } from '../utils/cx';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#071B33" />
      <path d="M6 24c4-3.4 8-3.4 12 0s8 3.4 12 0 6-2.6 6-2.6V34H6z" fill="#22A396" />
      <path d="M8 18.5c3.3-2.8 6.7-2.8 10 0s6.7 2.8 10 0" stroke="#FBF8F2" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="29" cy="11" r="2.4" fill="#FBF8F2" />
    </svg>
  );
}

/** Ilustração do hero: caixa aberta com material de pesca, sobre ondulação. */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 400" className={className} role="img" aria-labelledby="hero-art-t">
      <title id="hero-art-t">Ilustração de uma caixa Maré Box aberta com amostras, linha e acessórios de pesca</title>
      <defs>
        <linearGradient id="h-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C4D80" />
          <stop offset="1" stopColor="#0B2A4A" />
        </linearGradient>
        <linearGradient id="h-box" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3EDE1" />
          <stop offset="1" stopColor="#E7DDCB" />
        </linearGradient>
        <linearGradient id="h-lure" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4FC0B4" />
          <stop offset="1" stopColor="#E7F3F1" />
        </linearGradient>
      </defs>
      <circle cx="372" cy="86" r="42" fill="#E0663E" opacity=".9" />
      <circle cx="372" cy="86" r="62" fill="none" stroke="#E0663E" opacity=".25" strokeWidth="2" />
      <path d="M0 250c40-14 80-14 120 0s80 14 120 0 80-14 120 0 80 14 120 0v150H0z" fill="url(#h-sea)" />
      <path d="M0 282c40-12 80-12 120 0s80 12 120 0 80-12 120 0 80 12 120 0" stroke="#4FC0B4" strokeWidth="3" fill="none" opacity=".55" />
      <path d="M0 318c40-10 80-10 120 0s80 10 120 0 80-10 120 0 80 10 120 0" stroke="#93D9D1" strokeWidth="2" fill="none" opacity=".35" />
      <g className="motion-safe:animate-drift">
        {/* tampa */}
        <path d="M132 168 L248 120 L372 160 L262 214 Z" fill="#CDBFA6" />
        <path d="M132 168 L118 120 L232 76 L248 120 Z" fill="#E7DDCB" />
        {/* conteúdo */}
        <rect x="186" y="128" width="16" height="70" rx="3" transform="rotate(-24 194 163)" fill="#071B33" />
        <rect x="183" y="122" width="22" height="10" rx="2" transform="rotate(-24 194 127)" fill="#22A396" />
        <g transform="rotate(-12 286 148)">
          <ellipse cx="288" cy="150" rx="46" ry="14" fill="url(#h-lure)" stroke="#0B2A4A" strokeWidth="2.5" />
          <circle cx="252" cy="147" r="4" fill="#071B33" />
          <path d="M334 150 l18 -10 l-4 10 l4 10z" fill="#0B2A4A" />
          <path d="M244 156 l-14 10" stroke="#0B2A4A" strokeWidth="2.5" />
          <path d="M290 164 v10 m-6 4 a6 6 0 0 0 12 0" stroke="#0B2A4A" strokeWidth="2.2" fill="none" />
        </g>
        <g transform="translate(222 158)">
          <circle r="22" fill="#F3EDE1" stroke="#0B2A4A" strokeWidth="2.5" />
          <circle r="15" fill="#E0663E" />
          <circle r="5" fill="#F3EDE1" />
        </g>
        {/* caixa */}
        <path d="M132 168 L262 214 L262 316 L132 268 Z" fill="url(#h-box)" />
        <path d="M262 214 L372 160 L372 262 L262 316 Z" fill="#E7DDCB" />
        <path d="M262 214 L372 160 L372 262 L262 316 Z" fill="#071B33" opacity=".08" />
        <path d="M132 168 L262 214 L372 160" stroke="#0B2A4A" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <g transform="translate(170 228) skewY(19)">
          <rect width="64" height="28" rx="6" fill="#071B33" />
          <text x="32" y="18.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FBF8F2" fontFamily="Bricolage Grotesque Variable, sans-serif">
            MARÉ BOX
          </text>
        </g>
        <g transform="translate(300 222) skewY(-26)">
          <rect width="46" height="18" rx="9" fill="#22A396" />
          <text x="23" y="12.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#071B33" fontFamily="Manrope Variable, sans-serif">
            SURPRESA
          </text>
        </g>
      </g>
      <path d="M58 228 q14 -10 28 0" stroke="#FBF8F2" strokeWidth="2.5" fill="none" opacity=".65" strokeLinecap="round" />
      <path d="M90 210 q10 -7 20 0" stroke="#FBF8F2" strokeWidth="2.5" fill="none" opacity=".45" strokeLinecap="round" />
    </svg>
  );
}

const sceneTitles: Record<Modality, string> = {
  'spinning-mar': 'Pescador em rochas junto ao mar, a lançar uma amostra',
  surfcasting: 'Canas de surfcasting em suporte numa praia ao entardecer',
  achiga: 'Albufeira com caniçal e um achigã a atacar uma amostra',
};

export function ModalityArt({ modality, className }: { modality: Modality; className?: string }) {
  const id = `m-${modality}`;
  return (
    <svg viewBox="0 0 320 200" className={cx('block', className)} role="img" aria-label={sceneTitles[modality]} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={modality === 'surfcasting' ? '#F3C9A8' : modality === 'achiga' ? '#DCEFE9' : '#CFE6F2'} />
          <stop offset="1" stopColor="#FBF8F2" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={modality === 'achiga' ? '#14857C' : '#1C4D80'} />
          <stop offset="1" stopColor={modality === 'achiga' ? '#0C5651' : '#071B33'} />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id}-sky)`} />
      {modality === 'spinning-mar' && (
        <>
          <circle cx="250" cy="52" r="20" fill="#FBF8F2" stroke="#E0663E" strokeWidth="3" />
          <rect y="112" width="320" height="88" fill={`url(#${id}-water)`} />
          <path d="M0 118c26-8 52-8 78 0s52 8 78 0 52-8 78 0 52 8 86 0" stroke="#93D9D1" strokeWidth="2.5" fill="none" />
          <path d="M150 200 L190 132 L232 140 L270 118 L320 126 V200 Z" fill="#123A63" />
          <path d="M190 132 L210 150 L232 140" fill="#2F659C" opacity=".6" />
          <g stroke="#071B33" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M246 120 v-22" />
            <path d="M246 98 l-6 -12 h12 z" fill="#071B33" />
            <path d="M246 104 l-12 10 M246 104 l10 8 l-30 -34" />
          </g>
          <circle cx="246" cy="82" r="5" fill="#071B33" />
          <path d="M216 78 Q140 30 70 112" stroke="#071B33" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
          <path d="M68 108 l10 3 -10 3z" fill="#E0663E" />
        </>
      )}
      {modality === 'surfcasting' && (
        <>
          <circle cx="90" cy="96" r="26" fill="#E0663E" opacity=".9" />
          <rect y="100" width="320" height="50" fill={`url(#${id}-water)`} />
          <path d="M0 110c30-6 60-6 90 0s60 6 90 0 60-6 90 0 40 4 50 2" stroke="#93D9D1" strokeWidth="2" fill="none" />
          <path d="M0 140c50-8 120-10 180-4s100 8 140 2V200H0z" fill="#E7DDCB" />
          <path d="M0 150c60-6 140-6 200 0s90 4 120 0" stroke="#FBF8F2" strokeWidth="3" fill="none" />
          <g stroke="#071B33" strokeWidth="2.6" strokeLinecap="round">
            <path d="M206 180 L230 128 M222 180 L230 128 M238 180 L230 128" />
            <path d="M226 136 L288 18" />
            <path d="M232 136 L304 32" />
          </g>
          <circle cx="288" cy="18" r="3" fill="#22A396" />
          <circle cx="304" cy="32" r="3" fill="#22A396" />
          <path d="M288 18 Q200 30 120 104" stroke="#071B33" strokeWidth="1" fill="none" />
        </>
      )}
      {modality === 'achiga' && (
        <>
          <path d="M0 96 Q60 64 120 86 T240 78 T320 84 V120 H0z" fill="#93D9D1" opacity=".55" />
          <rect y="112" width="320" height="88" fill={`url(#${id}-water)`} />
          <path d="M0 116c40-5 80-5 120 0s80 5 120 0 60-4 80 0" stroke="#C9ECE8" strokeWidth="2" fill="none" />
          <g stroke="#0C5651" strokeWidth="3" strokeLinecap="round">
            <path d="M24 130 V70 M34 130 V58 M44 130 V76 M276 130 V66 M288 130 V54 M298 130 V72" />
          </g>
          <g fill="#0C5651">
            <ellipse cx="34" cy="56" rx="3" ry="9" />
            <ellipse cx="288" cy="52" rx="3" ry="9" />
          </g>
          <g transform="translate(148 154) rotate(-14)">
            <path d="M-44 0 Q-10 -24 30 -4 L48 -16 L44 4 L50 22 L30 8 Q-10 26 -44 0z" fill="#0B2A4A" />
            <path d="M-44 0 Q-30 4 -20 2" stroke="#FBF8F2" strokeWidth="2" fill="none" />
            <circle cx="-30" cy="-6" r="3" fill="#FBF8F2" />
            <path d="M-10 -14 l8 -10 l10 8" fill="#123A63" />
          </g>
          <ellipse cx="96" cy="128" rx="12" ry="4" fill="#E0663E" />
          <path d="M96 124 v-30" stroke="#071B33" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

const catColors: Record<ProductCategory, string> = {
  amostras: '#E8F6F4',
  vinis: '#FCE9E2',
  anzois: '#EEF2F7',
  destorcedores: '#F3EDE1',
  chumbos: '#EEF2F7',
  linhas: '#E8F6F4',
  acessorios: '#F3EDE1',
  organizacao: '#FCE9E2',
};

/** Ilustração genérica por categoria de produto (sem marcas). */
export function ProductArt({ category, className, label }: { category: ProductCategory; className?: string; label?: string }) {
  const s = { stroke: '#0B2A4A', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 120 120" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <rect width="120" height="120" rx="20" fill={catColors[category]} />
      {category === 'amostras' && (
        <g>
          <ellipse cx="62" cy="58" rx="34" ry="12" fill="#4FC0B4" {...{ stroke: s.stroke, strokeWidth: 3 }} />
          <circle cx="36" cy="55" r="3.5" fill="#071B33" />
          <path d="M96 58 l12 -8 v16z" fill="#0B2A4A" />
          <path d="M28 64 l-10 8" {...s} />
          <path d="M60 70 v10 m-6 4 a6 6 0 0 0 12 0 M78 68 v10" {...s} strokeWidth={2.5} />
        </g>
      )}
      {category === 'vinis' && (
        <g>
          <path d="M22 60 Q40 40 62 56 T100 54 l8 -10 v26 l-8 -8 Q80 72 62 66 T22 60z" fill="#E0663E" stroke="#0B2A4A" strokeWidth="3" />
          <path d="M50 52 v12 M60 54 v12 M70 56 v10" stroke="#FBF8F2" strokeWidth="2" />
          <circle cx="30" cy="57" r="2.5" fill="#071B33" />
        </g>
      )}
      {category === 'anzois' && (
        <g>
          <path d="M60 22 v52 a16 16 0 0 1 -32 0 v-6 l8 6" {...s} strokeWidth={4} />
          <circle cx="60" cy="20" r="5" {...s} />
          <path d="M84 40 v34 a10 10 0 0 1 -20 0" {...s} strokeWidth={2.5} opacity=".5" />
        </g>
      )}
      {category === 'destorcedores' && (
        <g {...s}>
          <circle cx="60" cy="26" r="8" />
          <rect x="52" y="38" width="16" height="22" rx="6" fill="#4FC0B4" />
          <circle cx="60" cy="72" r="8" />
          <path d="M60 80 v10 q0 8 8 8 h4 q8 0 8 -8 v-6" />
        </g>
      )}
      {category === 'chumbos' && (
        <g>
          <path d="M60 24 L84 84 H36 z" fill="#5E6B78" stroke="#0B2A4A" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="60" cy="20" r="5" {...s} />
          <path d="M44 84 l-10 14 M76 84 l10 14" {...s} />
        </g>
      )}
      {category === 'linhas' && (
        <g>
          <ellipse cx="60" cy="38" rx="30" ry="10" fill="#FBF8F2" stroke="#0B2A4A" strokeWidth="3" />
          <path d="M30 38 v40 a30 10 0 0 0 60 0 v-40" fill="#22A396" stroke="#0B2A4A" strokeWidth="3" />
          <path d="M32 52 a30 10 0 0 0 56 0 M32 64 a30 10 0 0 0 56 0" stroke="#0C5651" strokeWidth="2" fill="none" />
          <ellipse cx="60" cy="38" rx="8" ry="3" fill="#0B2A4A" />
        </g>
      )}
      {category === 'acessorios' && (
        <g {...s}>
          <path d="M40 92 l22 -40 M80 92 l-22 -40" strokeWidth={4} />
          <path d="M52 52 q8 -26 16 0" fill="#4FC0B4" />
          <circle cx="40" cy="96" r="7" />
          <circle cx="80" cy="96" r="7" />
          <path d="M57 30 v-8 M63 30 v-8" />
        </g>
      )}
      {category === 'organizacao' && (
        <g {...s}>
          <rect x="20" y="34" width="80" height="54" rx="8" fill="#FBF8F2" />
          <path d="M20 54 h80 M46 54 v34 M72 54 v34" />
          <rect x="48" y="26" width="24" height="10" rx="4" fill="#22A396" />
        </g>
      )}
    </svg>
  );
}

const planStyles: Record<PlanId, { lid: string; body: string; band: string }> = {
  essencial: { lid: '#E7DDCB', body: '#F3EDE1', band: '#22A396' },
  explorador: { lid: '#123A63', body: '#1C4D80', band: '#4FC0B4' },
  premium: { lid: '#071B33', body: '#0B2A4A', band: '#E0663E' },
};

export function PlanBoxArt({ planId, className }: { planId: PlanId; className?: string }) {
  const c = planStyles[planId];
  const scale = planId === 'essencial' ? 0.82 : planId === 'explorador' ? 0.92 : 1;
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <g transform={`translate(60 56) scale(${scale}) translate(-60 -56)`}>
        <path d="M18 40 L60 24 L102 40 L60 56 Z" fill={c.lid} stroke="#071B33" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 40 L60 56 V92 L18 76 Z" fill={c.body} stroke="#071B33" strokeWidth="2" strokeLinejoin="round" />
        <path d="M60 56 L102 40 V76 L60 92 Z" fill={c.body} stroke="#071B33" strokeWidth="2" strokeLinejoin="round" />
        <path d="M60 56 L102 40 V76 L60 92 Z" fill="#071B33" opacity=".15" />
        <path d="M39 32 L81 48 V84" stroke={c.band} strokeWidth="6" fill="none" />
      </g>
    </svg>
  );
}
