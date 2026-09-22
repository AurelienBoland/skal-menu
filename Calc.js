// Calc.js — instant answers in the launcher search box: arithmetic with
// functions/constants/bases, and unit conversions. Pure JS, no eval: a
// recursive-descent parser only ever visits tokens it understands, so a
// query like "1password" or "fire" returns null and the search list is
// left exactly as the stock menu renders it.
// API: evaluate(query) -> null | { label, value, kind }
//   label  display text for the row ("= 42", "= 3.107 mi")
//   value  the copyable string, unformatted ("42", "3.106856")
//   kind   "math" | "convert"

.pragma library

var FUNCTIONS = {
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, round: Math.round,
  floor: Math.floor, ceil: Math.ceil, exp: Math.exp,
  ln: Math.log, log: Math.log, log2: Math.log2, log10: Math.log10,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan
}

var CONSTANTS = { pi: Math.PI, tau: 2 * Math.PI, e: Math.E }

// ---- unit tables ------------------------------------------------------
// Length in meters, mass in grams, speed in m/s, volume in liters, time in
// seconds. Data units are case-sensitive (b = bit, B = byte; decimal k/M/G
// vs binary KiB/MiB); every other family matches case-insensitively.
var LENGTH = { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, inch: 0.0254, inches: 0.0254, ft: 0.3048, foot: 0.3048, feet: 0.3048, yd: 0.9144, yard: 0.9144, yards: 0.9144, mi: 1609.344, mile: 1609.344, miles: 1609.344, nmi: 1852 }
var MASS = { mg: 0.001, g: 1, kg: 1000, t: 1e6, oz: 28.349523125, lb: 453.59237, lbs: 453.59237, pound: 453.59237, pounds: 453.59237, st: 6350.29318, stone: 6350.29318 }
var SPEED = { kmh: 1000 / 3600, kph: 1000 / 3600, mph: 0.44704, ms: 1, mps: 1, kn: 0.514444, knot: 0.514444, knots: 0.514444 }
var VOLUME = { ml: 0.001, l: 1, liter: 1, liters: 1, litre: 1, litres: 1, gal: 3.785411784, gallon: 3.785411784, gallons: 3.785411784, qt: 0.946352946, quart: 0.946352946, pt: 0.473176473, pint: 0.473176473, cup: 0.2365882365, cups: 0.2365882365, floz: 0.0295735295625 }
var TIME = { ms: 0.001, s: 1, sec: 1, secs: 1, min: 60, mins: 60, h: 3600, hr: 3600, hrs: 3600, hour: 3600, hours: 3600, d: 86400, day: 86400, days: 86400, wk: 604800, week: 604800, weeks: 604800 }
var DATA = { b: 0.125, bit: 0.125, bits: 0.125, B: 1, byte: 1, bytes: 1, kb: 1e3, kB: 1e3, mb: 1e6, MB: 1e6, gb: 1e9, GB: 1e9, tb: 1e12, TB: 1e12, pb: 1e15, PB: 1e15, kib: 1024, KiB: 1024, mib: 1048576, MiB: 1048576, gib: 1073741824, GiB: 1073741824, tib: 1099511627776, TiB: 1099511627776 }

var FAMILIES = [
  { name: "length", units: LENGTH, ci: true },
  { name: "mass", units: MASS, ci: true },
  { name: "speed", units: SPEED, ci: true },
  { name: "volume", units: VOLUME, ci: true },
  { name: "time", units: TIME, ci: true },
  { name: "data", units: DATA, ci: false }
]

var TEMP = { c: "c", f: "f", k: "k", celsius: "c", fahrenheit: "f", kelvin: "k" }

function tempToC(v, u) {
  if (u === "f") return (v - 32) * 5 / 9
  if (u === "k") return v - 273.15
  return v
}

function tempFromC(c, u) {
  if (u === "f") return c * 9 / 5 + 32
  if (u === "k") return c + 273.15
  return c
}

// ---- number formatting ------------------------------------------------

function trimNumber(n) {
  if (!isFinite(n)) return null
  if (n === 0) return "0"
  var abs = Math.abs(n)
  if (abs >= 1e15 || abs < 1e-9) return n.toExponential(6).replace(/\.?0+e/, "e")
  var s = Number(n.toPrecision(12)).toString()
  return s
}

function group(s) {
  var neg = s.charAt(0) === "-"
  if (neg) s = s.slice(1)
  var parts = s.split("e")
  var mantissa = parts[0]
  var dot = mantissa.indexOf(".")
  var intPart = dot < 0 ? mantissa : mantissa.slice(0, dot)
  var frac = dot < 0 ? "" : mantissa.slice(dot)
  var grouped = ""
  while (intPart.length > 3) {
    grouped = "," + intPart.slice(-3) + grouped
    intPart = intPart.slice(0, -3)
  }
  grouped = intPart + grouped
  return (neg ? "-" : "") + grouped + frac + (parts.length > 1 ? "e" + parts[1] : "")
}

// ---- tokenizer ---------------------------------------------------------

var TOKEN_RE = /^\s*(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|[A-Za-z_][A-Za-z_0-9]*|\*\*|[-+*/%^(),])/

function tokenize(src) {
  var tokens = []
  var rest = src
  while (rest.length > 0) {
    if (/^\s+/.test(rest)) { rest = rest.slice(/^\s+/.exec(rest)[0].length); continue }
    var m = TOKEN_RE.exec(rest)
    if (!m) return null
    tokens.push(m[1])
    rest = rest.slice(m[1].length)
  }
  return tokens.length ? tokens : null
}

// ---- recursive-descent parser -------------------------------------------

function Parser(tokens) {
  this.tokens = tokens
  this.pos = 0
}

Parser.prototype.peek = function() { return this.tokens[this.pos] || null }
Parser.prototype.next = function() { return this.tokens[this.pos++] || null }
Parser.prototype.expect = function(t) {
  if (this.peek() !== t) throw "syntax"
  this.pos++
}

Parser.prototype.parseExpr = function() {
  var v = this.parseTerm()
  while (this.peek() === "+" || this.peek() === "-") {
    var op = this.next()
    var r = this.parseTerm()
    v = op === "+" ? v + r : v - r
  }
  return v
}

Parser.prototype.parseTerm = function() {
  var v = this.parseUnary()
  while (true) {
    var p = this.peek()
    if (p === "*" || p === "/" || p === "%") {
      this.next()
      var r = this.parseUnary()
      if (p === "*") v = v * r
      else if (p === "/") { if (r === 0) throw "div0"; v = v / r }
      else { if (r === 0) throw "div0"; v = v % r }
    } else if (p === "(" || p === "." || (p !== null && /^[0-9]/.test(p)) || (p !== null && /^[A-Za-z_]/.test(p))) {
      // implicit multiplication: 2(3+1), 2pi, (1+2)(3+4)
      v = v * this.parseUnary()
    } else break
  }
  return v
}

Parser.prototype.parseUnary = function() {
  if (this.peek() === "-") { this.next(); return -this.parseUnary() }
  if (this.peek() === "+") { this.next(); return this.parseUnary() }
  return this.parsePower()
}

Parser.prototype.parsePower = function() {
  var base = this.parseAtom()
  var p = this.peek()
  if (p === "^" || p === "**") {
    this.next()
    var exp = this.parseUnary()
    return Math.pow(base, exp)
  }
  return base
}

Parser.prototype.parseAtom = function() {
  var t = this.next()
  if (t === null) throw "syntax"

  if (t === "(") {
    var v = this.parseExpr()
    this.expect(")")
    return v
  }

  if (/^0x/.test(t)) return parseInt(t.slice(2), 16)
  if (/^0b/.test(t)) return parseInt(t.slice(2), 2)
  if (/^0o/.test(t)) return parseInt(t.slice(2), 8)
  if (/^(\d|\.\d)/.test(t)) {
    var n = parseFloat(t)
    if (isNaN(n)) throw "syntax"
    return n
  }

  if (/^[A-Za-z_]/.test(t)) {
    var lower = t.toLowerCase()
    if (CONSTANTS.hasOwnProperty(lower)) return CONSTANTS[lower]
    if (FUNCTIONS.hasOwnProperty(lower)) {
      this.expect("(")
      var args = [this.parseExpr()]
      while (this.peek() === ",") { this.next(); args.push(this.parseExpr()) }
      this.expect(")")
      return FUNCTIONS[lower].apply(null, args)
    }
    throw "syntax"
  }

  throw "syntax"
}

function evalExpression(src) {
  var tokens = tokenize(src)
  if (!tokens) return null
  // Only treat it as math when it actually does something: an operator,
  // a function, or a base literal, not a bare word a search should keep.
  var interesting = false
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i]
    if (/^[-+*/%^,()]$/.test(t) || t === "**") {
      // an operator between digits is math; a leading sign on a word is not
      if (i > 0 && i < tokens.length - 1) { interesting = true; break }
    }
    if (/^0[xbo]/i.test(t)) { interesting = true; break }
    if (/^[A-Za-z_]/.test(t) && CONSTANTS.hasOwnProperty(t.toLowerCase())) { interesting = true; break }
    if (/^[A-Za-z_]/.test(t) && FUNCTIONS.hasOwnProperty(t.toLowerCase()) && tokens[i + 1] === "(") { interesting = true; break }
  }
  if (!interesting) return null

  var p = new Parser(tokens)
  try {
    var v = p.parseExpr()
    if (p.pos !== tokens.length) return null
    return v
  } catch (e) {
    return null
  }
}

// ---- conversions ---------------------------------------------------------

var CONVERT_RE = /^(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\s*([A-Za-z°]+[A-Za-z_0-9]*)?\s*(?:to|in|as|->|→)\s*([A-Za-z°]+[A-Za-z_0-9]*)$/

function lookupUnit(unit, family) {
  if (family.ci) {
    var lower = unit.toLowerCase()
    if (family.units.hasOwnProperty(lower)) return { factor: family.units[lower] }
    return null
  }
  if (family.units.hasOwnProperty(unit)) return { factor: family.units[unit] }
  return null
}

function evalConversion(query) {
  var m = CONVERT_RE.exec(query.trim())
  if (!m) return null
  var value = parseFloat(m[1])
  if (isNaN(value)) return null
  var fromRaw = (m[2] || "").replace(/°/g, "")
  var toRaw = m[3].replace(/°/g, "")
  if (!fromRaw || !toRaw) return null

  // temperature first: formulas, not factors
  var tf = TEMP[fromRaw.toLowerCase()]
  var tt = TEMP[toRaw.toLowerCase()]
  if (tf && tt) {
    var c = tempToC(value, tf)
    if (c < -273.15) return null
    var out = trimNumber(tempFromC(c, tt))
    if (out === null) return null
    var unit = tt === "k" ? " K" : "°" + tt.toUpperCase()
    return { label: "= " + group(out) + unit, value: out, kind: "convert" }
  }

  for (var i = 0; i < FAMILIES.length; i++) {
    var fam = FAMILIES[i]
    var from = lookupUnit(fromRaw, fam)
    var to = lookupUnit(toRaw, fam)
    if (from && to) {
      var base = value * from.factor
      var result = base / to.factor
      var out2 = trimNumber(result)
      if (out2 === null) return null
      var toName = fam.ci ? toRaw.toLowerCase() : toRaw
      return { label: "= " + group(out2) + " " + toName, value: out2, kind: "convert" }
    }
  }
  return null
}

// ---- entry point ---------------------------------------------------------

function evaluate(query) {
  var q = String(query || "").trim()
  if (!q || !/\d/.test(q)) return null

  var conv = evalConversion(q)
  if (conv) return conv

  var v = evalExpression(q)
  if (v === null) return null
  var out = trimNumber(v)
  if (out === null) return null
  return { label: "= " + group(out), value: out, kind: "math" }
}
