// Tiny Lua/Luau highlighter (no dependencies). Returns HTML-safe markup with <span class="t-*"> tokens.
const KW = new Set('and break do else elseif end false for function goto if in local nil not or repeat return then true until while continue'.split(' '))
const BI = new Set('game workspace script Instance Vector3 Vector2 CFrame Color3 BrickColor UDim UDim2 Enum Ray TweenInfo Random Rect NumberRange NumberSequence ColorSequence task wait spawn delay tick time os math string table coroutine debug utf8 bit32 print warn error assert pcall xpcall require loadstring tostring tonumber type typeof pairs ipairs next select rawget rawset setmetatable getmetatable unpack getgenv getrenv getfenv setfenv shared _G _VERSION Drawing'.split(' '))
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const re = /(--\[(=*)\[[\s\S]*?\]\2\]|--[^\n]*)|(\[(=*)\[[\s\S]*?\]\4\]|"(?:\\[\s\S]|[^"\\\n])*"?|'(?:\\[\s\S]|[^'\\\n])*'?)|(0[xX][\da-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)|([A-Za-z_]\w*)|([\s\S])/g

export function highlight(src: string): string {
  if (src.length > 200000) return esc(src) // keep huge files fast
  return src.replace(re, (m: string, c, _a, s, _b, n, id, _o, off: number, whole: string) => {
    if (c) return `<span class="t-c">${esc(m)}</span>`
    if (s) return `<span class="t-s">${esc(m)}</span>`
    if (n) return `<span class="t-n">${m}</span>`
    if (id) {
      if (KW.has(id)) return `<span class="t-k">${id}</span>`
      if (BI.has(id)) return `<span class="t-b">${id}</span>`
      if (whole[off + m.length] === '(') return `<span class="t-f">${id}</span>`
      return id
    }
    return esc(m)
  })
}
