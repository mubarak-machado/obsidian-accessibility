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
if (
  /processFrontMatter|fileManager\.processFrontMatter|\.vault\.(?:modify|append|create|delete|trash|rename)\(/.test(
    bundle,
  )
) {
  failures.push('bundle contém rota de escrita fora da operação atômica autorizada');
}
if (!bundle.includes('.vault.process(')) {
  failures.push('bundle não contém a operação atômica autorizada para anotação');
}
if (
  !bundle.includes('selectionchange') ||
  !bundle.includes('getSectionInfo') ||
  !bundle.includes('mark-reading-selection') ||
  !bundle.includes('erase-reading-highlight')
) {
  failures.push('bundle não contém o fluxo móvel completo de anotação no modo leitura');
}
if (!styles.includes('safe-area-inset-left') || !styles.includes('safe-area-inset-right')) {
  failures.push('CSS não contempla as safe areas laterais');
}
if (
  !styles.includes('writing-mode: vertical-lr') ||
  !styles.includes('direction: rtl') ||
  !styles.includes('.oa-font-scale-panel__range-track') ||
  !styles.includes('.oa-font-scale-panel__range-thumb')
) {
  failures.push('controle não preserva semântica e pintura vertical separadas');
}
if (
  !styles.includes('top: var(--oa-font-scale-range-position, 50%)') ||
  !styles.includes('transform: translate(-50%, -50%)') ||
  !bundle.includes('setPointerCapture') ||
  !bundle.includes('releasePointerCapture')
) {
  failures.push('slider não alinha nem captura o arrasto vertical explicitamente');
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
  !styles.includes('--oa-launcher-size: 72px;') ||
  !styles.includes('--oa-panel-width: 75px;') ||
  !styles.includes('--oa-control-size: 66px;') ||
  !styles.includes('--oa-launcher-size: 48px;') ||
  !styles.includes('--oa-launcher-size: 24px;') ||
  !styles.includes('height: clamp(var(--oa-range-min), 27vh, var(--oa-range-max));') ||
  !styles.includes('--oa-thumb-size: 33px;')
) {
  failures.push('controle não preserva as escalas intrínsecas de 50%, 100% e 150%');
}
if (!styles.includes('prefers-reduced-transparency')) {
  failures.push('CSS não respeita transparência reduzida');
}
if (!styles.includes('prefers-reduced-motion')) failures.push('CSS não respeita movimento reduzido');
if (
  !styles.includes('.oa-font-scale-panel__annotation.is-active') ||
  !styles.includes('.oa-font-scale-panel__mode.is-annotation-mode::after') ||
  !styles.includes('var(--text-highlight-bg)')
) {
  failures.push('CSS não contém o estado compacto e a amostra de cor da anotação');
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FALHA: ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Bundle móvel validado: ${bundleStat.size} bytes, sem Node/Electron e com escrita restrita a Vault.process`,
  );
}
