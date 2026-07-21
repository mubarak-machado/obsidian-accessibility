import { readFile, stat } from 'node:fs/promises';

const [manifestText, bundle, styles, bundleStat] = await Promise.all([
  readFile('manifest.json', 'utf8'),
  readFile('main.js', 'utf8'),
  readFile('styles.css', 'utf8'),
  stat('main.js'),
]);
const manifest = JSON.parse(manifestText);

const failures = [];
if (manifest.isDesktopOnly !== false) failures.push('manifesto precisa declarar isDesktopOnly=false');
if (bundleStat.size > 100_000) failures.push('bundle excede o teto inicial de 100 KB');
if (/require\(["'](?:electron|fs|node:|path|child_process)/.test(bundle)) {
  failures.push('bundle móvel contém dependência Node/Electron');
}
if (/processFrontMatter|fileManager\.processFrontMatter|vault\.modify/.test(bundle)) {
  failures.push('bundle contém rota de escrita em notas');
}
if (!styles.includes('safe-area-inset-left') || !styles.includes('safe-area-inset-right')) {
  failures.push('CSS não contempla as safe areas laterais');
}
if (
  !styles.includes('writing-mode: vertical-lr') ||
  !styles.includes('direction: rtl') ||
  !styles.includes('inline-size: clamp(222px, 27vh, 255px)')
) {
  failures.push('controle não usa a geometria vertical nativa com máximo no topo');
}
if (
  !styles.includes('@supports not (writing-mode: vertical-lr)') ||
  !styles.includes('rotate(-90deg)')
) {
  failures.push('controle não preserva o fallback vertical para WebKit antigo');
}
if (
  !styles.includes('::-webkit-slider-runnable-track') ||
  !styles.includes('::-webkit-slider-thumb')
) {
  failures.push('slider não define trilho e puxador visíveis no WebKit/Blink');
}
if (!bundle.includes('aria-orientation') || !bundle.includes('vertical')) {
  failures.push('bundle não expõe a orientação vertical para acessibilidade');
}
if (!bundle.includes('aria-pressed') || !bundle.includes('oa-zen-mode')) {
  failures.push('bundle não expõe estado acessível nem limpeza do modo Zen');
}
if (
  !styles.includes(
    'body.oa-zen-mode .mod-root .workspace-tabs .workspace-tab-header-container',
  )
) {
  failures.push('CSS não restringe o modo Zen à interface do Obsidian');
}
if (
  styles.includes('body.oa-zen-mode .workspace-drawer') ||
  styles.includes('body.oa-zen-mode .workspace-sidedock')
) {
  failures.push('modo Zen não pode remover drawers; o Outline deve continuar acessível por swipe');
}
if (!bundle.includes('leftSplit') || !bundle.includes('rightSplit')) {
  failures.push('bundle não captura as duas sidebars para restauração determinística');
}
if (
  !styles.includes('width: 72px;') ||
  !styles.includes('width: 75px;') ||
  !styles.includes('width: 66px;') ||
  !styles.includes('height: clamp(222px, 27vh, 255px);') ||
  !styles.includes('block-size: 66px;')
) {
  failures.push('controle não preserva a ampliação mecânica de 150%');
}
if (!styles.includes('prefers-reduced-motion')) failures.push('CSS não respeita movimento reduzido');

if (failures.length > 0) {
  for (const failure of failures) console.error(`FALHA: ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Bundle móvel validado: ${bundleStat.size} bytes, sem Node/Electron nem escrita em notas`);
}
