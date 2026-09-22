# Skål Menu

The Omarchy launcher menu ([omarchy.menu](https://github.com/omacom/omarchy) clone) with a calculator built into the search box.

Type an equation or a conversion as your search query and the answer appears as the first row, before apps and menu entries. Press Enter to copy it. Everything else behaves exactly like the stock menu: apps, submenus, scoped search, routes.

- Math: `2+2`, `(3+4)*2`, `2^10`, `2pi`, `sqrt(144)`, `0xff + 1`, `0b1010`, implicit multiplication like `2(3+4)`
- Functions: sqrt, cbrt, abs, round, floor, ceil, exp, ln, log, log2, log10, sin, cos, tan, asin, acos, atan
- Constants: pi, e, tau
- Conversions: `<value> <unit> to <unit>` (or `in`), across length, mass, temperature, speed, volume, time, and data (`5 km to mi`, `72f to c`, `100 kg in lb`, `100mph to kmh`, `1 cup to ml`, `3 hours to min`, `1024 mb to gb`)

Queries that are not math or conversions (`1password`, `firefox`) return normal search results, untouched.

## Install

```bash
omarchy plugin add https://github.com/outcrop-labs/skal-menu.git --enable --yes
```

Cloning from the built-in menu also works on an existing setup: `omarchy plugin clone omarchy.menu`, then rename/repoint as you like. The stock `omarchy menu` commands and the SUPER+SPACE binding keep working: omarchy resolves the built-in id to the enabled clone.

## Removal

```bash
omarchy plugin remove skal.menu
```
