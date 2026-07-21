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
if (!styles.includes('top: 50%') || !styles.includes('rotate(-90deg)')) {
  failures.push('controle não está centralizado com slider vertical');
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
if (!bundle.includes('aria-pressed') || !bundle.includes('oa-tab-bar-hidden')) {
  failures.push('bundle não expõe estado acessível nem limpeza da barra de abas');
}
if (
  !styles.includes(
    'body.oa-tab-bar-hidden .mod-root .workspace-tabs .workspace-tab-header-container',
  )
) {
  failures.push('CSS não restringe a ocultação da barra de abas à área principal');
}
if (!styles.includes('prefers-reduced-motion')) failures.push('CSS não respeita movimento reduzido');

if (failures.length > 0) {
  for (const failure of failures) console.error(`FALHA: ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Bundle móvel validado: ${bundleStat.size} bytes, sem Node/Electron nem escrita em notas`);
}
