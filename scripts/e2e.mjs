/**
 * Verificação de ponta a ponta da demonstração (Playwright, sem dependências de rede).
 * Uso: npm run build && npx vite preview --port 4173 & npm run e2e
 * Variáveis: BASE_URL (predefinido http://localhost:4173), CHROMIUM_PATH.
 */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const OUT = 'e2e-output';
mkdirSync(OUT, { recursive: true });
const defaultChromium = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync(defaultChromium) ? defaultChromium : undefined);

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath });

async function newPage(viewport) {
  const context = await browser.newContext({ viewport, locale: 'pt-PT' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return { context, page, errors };
}

/** Espera até o elemento estar visível (a navegação do router é assíncrona). */
const seen = (loc) => loc.first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false);
const toast = (page, re) => page.locator('[role="status"]').getByText(re).first().waitFor({ timeout: 5000 });
const tools = async (page) => {
  await page.getByRole('button', { name: /Ferramentas de demonstração|^Demo$/ }).last().click();
  await page.getByRole('dialog', { name: 'Ferramentas de demonstração' }).waitFor();
  return page.getByRole('dialog', { name: 'Ferramentas de demonstração' });
};
const closeDialog = (page) => page.keyboard.press('Escape');

// ---------- Percurso principal (desktop) ----------
{
  const { page, errors, context } = await newPage({ width: 1366, height: 900 });
  await page.goto(BASE + '/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  check('Página inicial com hero', await seen(page.getByRole('heading', { level: 1, name: /próxima descoberta de pesca/ })));
  check('Indicação persistente de modo demonstração', await seen(page.getByText('Modo demonstração').first()));
  await page.screenshot({ path: `${OUT}/desktop-home.png`, fullPage: true });

  await page.getByRole('link', { name: /Descobrir a minha box/ }).click();
  await page.waitForURL(/\/planos/);
  await page.getByText('Achigã', { exact: true }).first().click();
  await page.getByText('Selecionar Essencial').click();
  const aside = page.locator('aside');
  await page.waitForFunction(() => document.querySelector('aside')?.innerText.includes('23,80'), null, { timeout: 5000 }).catch(() => {});
  const asideText = await aside.innerText();
  check('Plano Essencial mostra portes 3,90 € e total 23,80 €', /3,90\s€/.test(asideText) && /23,80\s€/.test(asideText), asideText.replace(/\s+/g, ' ').slice(0, 160));
  await page.screenshot({ path: `${OUT}/desktop-planos.png`, fullPage: true });
  await aside.getByRole('link', { name: /Continuar/ }).click();
  await page.waitForURL(/\/checkout/);
  check('Checkout avisa que nenhuma cobrança é efetuada', await seen(page.getByText(/Nenhuma cobrança será efetuada/).first()));

  const cont = () => page.getByRole('button', { name: /^Continuar/ }).click();
  await cont(); // revisão
  check('Perfil com modalidade Achigã pré-selecionada', await page.getByRole('radio', { name: /Achigã/ }).isChecked());
  await cont(); // perfil
  await page.getByLabel(/Código postal/).fill('9000-001');
  await cont();
  check('Validação: código postal fora do Continente', await seen(page.getByText(/só entregamos em Portugal Continental/)));
  await page.getByLabel(/Código postal/).fill('2520-123');
  await cont(); // morada
  check('Sem pedido de número de cartão', (await page.locator('input[autocomplete="cc-number"], input[name*="card" i]').count()) === 0);
  check('Consentimento não pré-selecionado', !(await page.getByRole('checkbox', { name: /Aceito a renovação/ }).isChecked()));
  await cont();
  check('Validação: método de pagamento obrigatório', await seen(page.getByRole('alert').getByText(/método de pagamento/)));
  await page.getByText('Cartão de demonstração').click();
  await cont();
  check('Validação: consentimento obrigatório', await seen(page.getByRole('alert').getByText(/renovação recorrente/)));
  await page.getByRole('checkbox', { name: /Aceito a renovação/ }).check();
  await cont();
  await page.screenshot({ path: `${OUT}/desktop-checkout-confirmacao.png`, fullPage: true });
  await page.getByRole('button', { name: /Confirmar encomenda simulada/ }).dblclick();
  await page.waitForURL(/\/checkout\/confirmado\//);
  const orderNo = await page.locator('strong.font-display').innerText();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mare-box-demo')).data.orders.filter((o) => o.customerId === 'cus_visitante').length);
  check('Duplo clique cria uma única encomenda', stored === 1, `encomendas do visitante: ${stored}, n.º ${orderNo}`);
  await page.screenshot({ path: `${OUT}/desktop-confirmado.png`, fullPage: true });

  await page.getByRole('link', { name: 'Ir para a minha conta' }).click();
  check('Área de cliente mostra subscrição ativa', await seen(page.getByText('Ativa', { exact: true })));
  check('Área de cliente mostra estado da última encomenda', await seen(page.getByText('Pagamento simulado confirmado').first()));

  let dlg = await tools(page);
  await dlg.getByRole('button', { name: /Avançar até à entrega/ }).click();
  await toast(page, /entregue/);
  await closeDialog(page);
  await page.goto(BASE + '/conta/encomendas');
  await page.getByRole('link', { name: new RegExp(orderNo) }).click();
  await page.waitForURL(/\/conta\/encomendas\/.+/);
  check('Conteúdo revelado após envio simulado', await seen(page.getByText(/ un\.$/)) && !(await page.getByText(/só é revelado depois/).isVisible()));
  await page.screenshot({ path: `${OUT}/desktop-encomenda.png`, fullPage: true });

  // Subscrição: saltar, pausar, retomar
  await page.goto(BASE + '/conta/subscricao');
  await page.getByRole('button', { name: 'Saltar a próxima entrega' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Saltar entrega' }).click();
  await toast(page, /marcada para saltar/);
  await page.getByRole('button', { name: 'Pausar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Pausar' }).click();
  await toast(page, /pausada/);
  check('Pausa mostra ausência de cobranças', await seen(page.getByText(/não há cobranças simuladas/).first()));
  dlg = await tools(page);
  await dlg.getByRole('button', { name: /Simular próxima renovação/ }).click();
  await toast(page, /pausada/);
  check('Renovação recusada com subscrição pausada', true);
  await closeDialog(page);
  await page.getByRole('button', { name: 'Retomar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Retomar' }).click();
  await toast(page, /retomada/);
  check('Retomar agenda nova cobrança', await seen(page.getByText(/Próxima cobrança simulada/).first()));

  // ---------- Desbloqueio da primeira recompensa ----------
  dlg = await tools(page);
  await dlg.getByRole('button', { name: /Cliente com 2 caixas elegíveis/ }).click();
  await page.waitForURL(/\/conta$/);
  check('Mensagem "Falta 1 box"', await seen(page.getByText('Falta 1 box para desbloqueares a próxima recompensa.')));
  dlg = await tools(page);
  await dlg.getByRole('button', { name: /Simular próxima renovação/ }).click();
  await toast(page, /Renovação simulada/);
  await dlg.getByRole('button', { name: /Avançar até à entrega/ }).click();
  await toast(page, /Desbloqueaste a recompensa de nível 1/);
  const celebration = page.getByRole('dialog', { name: /Recompensa de nível 1 desbloqueada/ });
  await celebration.waitFor();
  check('Celebração ao desbloquear o marco', true);
  await page.screenshot({ path: `${OUT}/desktop-celebracao.png` });
  await celebration.getByRole('button', { name: 'Escolher recompensa' }).click();
  await page.waitForURL(/\/conta\/recompensas/);
  const level1 = page.locator('section', { has: page.getByRole('heading', { name: /Nível 1 · 3 boxes/ }) });
  await level1.getByRole('radio').first().check();
  await level1.getByRole('button', { name: 'Reservar para a próxima box' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reservar' }).click();
  await toast(page, /reservad/);
  check('Recompensa reservada', await seen(level1.getByText('Reservada', { exact: true }).first()));
  check('Resgate único (sem novo botão de reserva)', (await level1.getByRole('button', { name: 'Reservar para a próxima box' }).count()) === 0);
  dlg = await tools(page);
  await dlg.getByRole('button', { name: /Simular próxima renovação/ }).click();
  await toast(page, /Renovação simulada/);
  await dlg.getByRole('button', { name: /Avançar até à entrega/ }).click();
  await toast(page, /entregue/);
  await closeDialog(page);
  check('Recompensa recebida com a próxima encomenda', await seen(level1.getByText('Recebida', { exact: true }).first()));
  await page.screenshot({ path: `${OUT}/desktop-recompensas.png`, fullPage: true });

  // ---------- Gestor ----------
  await page.getByRole('button', { name: 'Ver como gestor' }).click();
  await page.waitForURL(/\/gestao$/);
  check('Painel de gestão com MRR', await seen(page.getByText('Receita recorrente mensal equivalente').first()));
  await page.screenshot({ path: `${OUT}/desktop-gestao.png`, fullPage: true });
  await page.goto(BASE + '/gestao/encomendas?estado=paid');
  await page.locator('tbody a').first().click();
  await page.getByRole('button', { name: /Em preparação/ }).click();
  await toast(page, /Em preparação/);
  check('Transição válida no painel de gestão', await seen(page.getByRole('button', { name: /Expedida/ })));

  // Persistência ao recarregar
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('mare-box-demo')).data.orders.length);
  await page.reload();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('mare-box-demo')).data.orders.length);
  check('Dados preservados ao recarregar', before === after && before > 0, `${after} encomendas`);

  // Dados inválidos → reposição segura
  await page.evaluate(() => localStorage.setItem('mare-box-demo', '{"schemaVersion":1,"data":{"oops":true}}'));
  await page.reload();
  check('Dados inválidos repostos com aviso', await seen(page.getByText('Dados repostos')));

  check('Sem erros de consola (desktop)', errors.length === 0, errors.slice(0, 3).join(' | '));
  await context.close();
}

// ---------- Responsivo: sem scroll horizontal ----------
const PAGES = ['/', '/planos', '/box/premium?modalidade=surfcasting', '/como-funciona', '/recompensas', '/demonstracao', '/checkout?plano=explorador&modalidade=achiga&modo=avulsa', '/conta', '/conta/subscricao', '/conta/encomendas', '/conta/perfil', '/conta/recompensas', '/conta/aprender', '/conta/aprender/texas', '/conta/desafios', '/gestao', '/gestao/clientes', '/gestao/encomendas', '/gestao/edicoes', '/gestao/edicoes/nova', '/gestao/produtos', '/gestao/recompensas'];
for (const [label, viewport] of [['movel-360', { width: 360, height: 780 }], ['tablet-768', { width: 768, height: 1024 }]]) {
  const { page, errors, context } = await newPage(viewport);
  await page.goto(BASE + '/');
  await page.evaluate(() => localStorage.clear());
  // Carrega um cliente com histórico para as páginas de conta terem conteúdo.
  await page.goto(BASE + '/demonstracao');
  await page.getByRole('button', { name: 'Ir direto ao cenário de recompensas' }).click();
  await page.waitForURL(/\/conta$/);
  const overflow = [];
  for (const p of PAGES) {
    await page.goto(BASE + p);
    await page.waitForLoadState('networkidle');
    const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    if (w.sw > w.iw) overflow.push(`${p} (${w.sw}px)`);
    if (['/', '/planos', '/conta', '/conta/recompensas', '/gestao', '/checkout?plano=explorador&modalidade=achiga&modo=avulsa'].includes(p)) {
      await page.screenshot({ path: `${OUT}/${label}${p.replace(/[/?=&]/g, '_') || '_home'}.png`, fullPage: true });
    }
  }
  check(`Sem scroll horizontal em ${label} (${PAGES.length} páginas)`, overflow.length === 0, overflow.join(', '));
  if (label === 'movel-360') {
    await page.goto(BASE + '/');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    check('Menu móvel abre com navegação', await seen(page.getByRole('navigation', { name: 'Principal (móvel)' })));
  }
  check(`Sem erros de consola (${label})`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await context.close();
}

// ---------- Teclado ----------
{
  const { page, context } = await newPage({ width: 1280, height: 800 });
  await page.goto(BASE + '/');
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
  check('Primeiro Tab foca "Saltar para o conteúdo"', first === 'Saltar para o conteúdo', first);
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram.`);
process.exit(failed.length ? 1 : 0);
