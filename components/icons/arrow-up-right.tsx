const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="100%" height="100%">
  <g class="icon-anim-group-aur" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 17V7H7M17 7L7 17"/></g>
</svg>`

export function ArrowUpRightIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <span className={className} style={{ display: 'inline-flex', width: size, height: size, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svgMarkup }} />
}
export default ArrowUpRightIcon
