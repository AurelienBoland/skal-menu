// Emoji.js — type a name, get the glyph: "shrug", "em dash", "smile" in the
// launcher search box, Enter copies it. Matching is exact-then-prefix only
// (a substring free-for-all drowned real searches in near-duplicate rows),
// results dedupe by glyph, and the table leans toward the names people
// actually type. API: search(query, limit) -> [{ name, glyph }].

.pragma library

var TABLE = [
  // faces and people
  ["smile", "😄"], ["smiley", "😃"], ["grin", "😁"], ["laugh", "😆"],
  ["joy", "😂"], ["rofl", "🤣"], ["sad", "😢"], ["cry", "😭"],
  ["tear", "😅"], ["sweat smile", "😅"], ["wink", "😉"], ["kiss", "😘"],
  ["tongue", "😜"], ["cool", "😎"], ["shades", "😎"], ["sunglasses", "😎"],
  ["nerd", "🤓"], ["thinking", "🤔"], ["facepalm", "🤦"], ["shrug face", "🤷"],
  ["neutral", "😐"], ["expressionless", "😑"], ["eye roll", "🙄"],
  ["smirk", "😏"], ["sleep", "😴"], ["zzz", "💤"], ["sick", "🤒"],
  ["mask", "😷"], ["poop", "💩"], ["robot", "🤖"], ["alien", "👽"],
  ["monster", "👾"], ["clown", "🤡"], ["party face", "🥳"],
  ["angry", "😠"], ["rage", "😡"], ["mind blown", "🤯"],
  ["lol face", "( ͡° ͜ʖ ͡°)"], ["shrug", "¯\\_(ツ)_/¯"],
  ["flip table", "(╯°□°)╯︵ ┻━┻"], ["unflip table", "┬─┬ ノ( ゜-゜ノ)"],
  ["thumbs up", "👍"], ["thumbs down", "👎"], ["ok hand", "👌"],
  ["clap", "👏"], ["wave", "👋"], ["pray", "🙏"], ["hands up", "🙌"],
  ["raised hands", "🙌"], ["muscle", "💪"], ["flex", "💪"],
  ["fist", "✊"], ["punch", "👊"], ["peace", "✌️"], ["victory", "✌️"],
  ["fingers crossed", "🤞"], ["point", "👉"], ["pinched", "🤏"],
  ["call me", "🤙"], ["eyes", "👀"], ["writing", "✍️"],
  // hearts and celebration
  ["heart", "❤️"], ["red heart", "❤️"], ["blue heart", "💙"],
  ["green heart", "💚"], ["yellow heart", "💛"], ["purple heart", "💜"],
  ["orange heart", "🧡"], ["black heart", "🖤"], ["sparkle heart", "💖"],
  ["broken heart", "💔"], ["heart eyes", "😍"], ["fire", "🔥"],
  ["flame", "🔥"], ["sparkles", "✨"], ["boom", "💥"], ["explosion", "💥"],
  ["star", "⭐"], ["glowing star", "🌟"], ["black star", "★"],
  ["white star", "☆"], ["party", "🎉"], ["tada", "🎉"],
  ["confetti", "🎊"], ["balloon", "🎈"], ["gift", "🎁"],
  ["trophy", "🏆"], ["medal", "🏅"], ["crown", "👑"], ["gem", "💎"],
  ["diamond", "💎"], ["rainbow", "🌈"], ["100", "💯"],
  // status marks
  ["check", "✅"], ["green check", "✅"], ["white check", "☑️"],
  ["checkbox", "☑️"], ["empty checkbox", "☐"], ["tick", "✔"],
  ["heavy check", "✔"], ["cross", "❌"], ["red x", "❌"],
  ["x mark", "✘"], ["ballot x", "✗"], ["question", "❓"],
  ["exclamation", "❗"], ["warning", "⚠️"], ["prohibited", "⛔"],
  ["stop", "🛑"], ["recycle", "♻️"], ["info", "ℹ️"],
  // tech and office
  ["light bulb", "💡"], ["idea", "💡"], ["magnifier", "🔍"],
  ["search", "🔍"], ["link", "🔗"], ["chain", "🔗"], ["paperclip", "📎"],
  ["clip", "📎"], ["pin", "📌"], ["bookmark", "🔖"], ["bell", "🔔"],
  ["megaphone", "📣"], ["speech", "💬"], ["chat", "💬"],
  ["comment", "💬"], ["mail", "✉️"], ["envelope", "✉️"],
  ["inbox", "📥"], ["outbox", "📤"], ["pencil", "✏️"], ["pen", "🖊️"],
  ["memo", "📝"], ["note", "📝"], ["book", "📖"], ["books", "📚"],
  ["library", "📚"], ["calendar", "📅"], ["chart", "📊"],
  ["chart up", "📈"], ["chart down", "📉"], ["folder", "📁"],
  ["file", "📄"], ["page", "📄"], ["save", "💾"], ["trash", "🗑️"],
  ["lock", "🔒"], ["unlock", "🔓"], ["key", "🔑"], ["shield", "🛡️"],
  ["wrench", "🔧"], ["hammer", "🔨"], ["gear", "⚙️"], ["tool", "🧰"],
  ["magnet", "🧲"], ["target", "🎯"], ["dart", "🎯"], ["bug", "🐛"],
  ["laptop", "💻"], ["desktop", "🖥️"], ["keyboard", "⌨️"],
  ["printer", "🖨️"], ["phone", "📱"], ["mobile", "📱"],
  ["watch", "⌚"], ["clock", "🕐"], ["alarm", "⏰"], ["timer", "⏱️"],
  ["stopwatch", "⏱️"], ["hourglass", "⏳"], ["battery", "🔋"],
  ["plug", "🔌"], ["zap", "⚡"], ["wifi", "📶"], ["camera", "📷"],
  ["video", "📹"], ["movie", "🎬"], ["film", "🎬"], ["music", "🎵"],
  ["headphones", "🎧"], ["microphone", "🎤"], ["game", "🎮"],
  ["controller", "🎮"], ["dice", "🎲"], ["puzzle", "🧩"],
  ["money", "💰"], ["money bag", "💰"], ["dollar bill", "💵"],
  ["shopping", "🛒"], ["cart", "🛒"],
  // nature and food
  ["sun", "☀️"], ["moon", "🌙"], ["cloud", "☁️"], ["umbrella", "☂️"],
  ["snowflake", "❄️"], ["droplet", "💧"], ["leaf", "🍃"], ["clover", "🍀"],
  ["tree", "🌳"], ["forest", "🌲"], ["cactus", "🌵"], ["flower", "🌸"],
  ["rose", "🌹"], ["tulip", "🌷"], ["sunflower", "🌻"], ["mushroom", "🍄"],
  ["dog", "🐕"], ["cat", "🐈"], ["panda", "🐼"], ["fox", "🦊"],
  ["bear", "🐻"], ["penguin", "🐧"], ["owl", "🦉"], ["unicorn", "🦄"],
  ["bee", "🐝"], ["butterfly", "🦋"], ["turtle", "🐢"], ["fish", "🐟"],
  ["whale", "🐋"], ["dolphin", "🐬"], ["octopus", "🐙"], ["crab", "🦀"],
  ["coffee", "☕"], ["tea", "🍵"], ["beer", "🍺"], ["wine", "🍷"],
  ["cocktail", "🍸"], ["pizza", "🍕"], ["burger", "🍔"], ["fries", "🍟"],
  ["taco", "🌮"], ["sushi", "🍣"], ["ramen", "🍜"], ["donut", "🍩"],
  ["cookie", "🍪"], ["cake", "🍰"], ["birthday cake", "🎂"],
  ["candy", "🍬"], ["chocolate", "🍫"], ["popcorn", "🍿"],
  ["apple", "🍎"], ["banana", "🍌"], ["grape", "🍇"], ["cherry", "🍒"],
  ["strawberry", "🍓"], ["watermelon", "🍉"], ["lemon", "🍋"],
  ["peach", "🍑"], ["pineapple", "🍍"], ["avocado", "🥑"],
  ["bread", "🍞"], ["croissant", "🥐"], ["cheese", "🧀"], ["egg", "🥚"],
  // transport
  ["airplane", "✈️"], ["rocket", "🚀"], ["car", "🚗"], ["taxi", "🚕"],
  ["bus", "🚌"], ["train", "🚆"], ["ship", "🚢"], ["bicycle", "🚲"],
  ["sailboat", "⛵"], ["map", "🗺️"], ["flag", "🏁"],
  // colors and shapes
  ["red circle", "🔴"], ["green circle", "🟢"], ["blue circle", "🔵"],
  ["yellow circle", "🟡"], ["orange circle", "🟠"], ["purple circle", "🟣"],
  ["black circle", "⚫"], ["white circle", "○"], ["half circle", "◐"],
  ["red square", "🟥"], ["green square", "🟩"], ["blue square", "🟦"],
  ["yellow square", "🟨"], ["black square", "■"], ["white square", "□"],
  ["diamond", "◆"], ["lozenge", "◊"], ["bullet", "•"],
  ["white bullet", "◦"], ["triangle bullet", "‣"], ["hyphen bullet", "⁃"],
  ["dot", "·"], ["middle dot", "·"], ["interpunct", "·"],
  // arrows and dashes
  ["arrow up", "↑"], ["arrow down", "↓"], ["arrow left", "←"],
  ["arrow right", "→"], ["arrow up right", "↗"], ["arrow down right", "↘"],
  ["arrow up left", "↖"], ["arrow down left", "↙"], ["double arrow", "⇔"],
  ["long arrow", "⟶"], ["chevron right", "›"], ["em dash", "—"],
  ["en dash", "–"], ["horizontal bar", "―"], ["ellipsis", "…"],
  // math and currency
  ["degree", "°"], ["plus minus", "±"], ["multiply", "×"],
  ["divide", "÷"], ["almost equal", "≈"], ["not equal", "≠"],
  ["less equal", "≤"], ["greater equal", "≥"], ["infinity", "∞"],
  ["square root", "√"], ["sum", "∑"], ["product", "∏"],
  ["integral", "∫"], ["pi", "π"], ["delta", "Δ"], ["sigma", "Σ"],
  ["ohm", "Ω"], ["micro", "µ"], ["euro", "€"], ["pound", "£"],
  ["yen", "¥"], ["cent", "¢"], ["rupee", "₹"], ["bitcoin", "₿"],
  // typography and law
  ["copyright", "©"], ["trademark", "™"], ["registered", "®"],
  ["section", "§"], ["paragraph", "¶"], ["dagger", "†"],
  ["double dagger", "‡"], ["sharp", "♯"], ["flat", "♭"], ["natural", "♮"]
]

function search(query, limit) {
  var q = String(query || "").trim().toLowerCase()
  if (q.length < 3) return []
  var max = limit || 4
  var ranked = []
  for (var i = 0; i < TABLE.length; i++) {
    var name = TABLE[i][0]
    if (name === q) { ranked.push({ rank: 0, entry: TABLE[i] }); continue }
    if (name.indexOf(q) === 0) ranked.push({ rank: 1, entry: TABLE[i] })
  }
  ranked.sort(function(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank
    return a.entry[0].length - b.entry[0].length
  })

  // Same glyph can arrive under several names; keep the best-ranked one so
  // the rows never read as duplicates.
  var seen = ({})
  var rows = []
  for (var j = 0; j < ranked.length && rows.length < max; j++) {
    var glyph = ranked[j].entry[1]
    if (seen[glyph]) continue
    seen[glyph] = true
    rows.push({ name: ranked[j].entry[0], glyph: glyph })
  }
  return rows
}
