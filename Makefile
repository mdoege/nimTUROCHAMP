all: ntc ntcjs.js

ntc: ntc.nim
	nim c -d:release --passC:"-flto" ntc

ntcjs.js: ntcjs.nim
	nim js -d:release ntcjs

