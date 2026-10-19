// Static markup; hover motion is driven externally in app/globals.css by the
// ancestor that should trigger it (e.g. ".site-nav a:hover .icon-anim-group-cr").
const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="100%" height="100%">
  <g class="icon-anim-group-cr" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18L15 12L9 6"/></g>
</svg>`

export function ChevronRightIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <span className={className} style={{ display: 'inline-flex', width: size, height: size, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svgMarkup }} />
}
export default ChevronRightIcon
