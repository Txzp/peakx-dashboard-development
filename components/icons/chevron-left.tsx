const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="100%" height="100%">
  <g class="icon-anim-group-cl" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18L9 12L15 6"/></g>
</svg>`

export function ChevronLeftIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <span className={className} style={{ display: 'inline-flex', width: size, height: size, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svgMarkup }} />
}
export default ChevronLeftIcon
