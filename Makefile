all: ntc ntcjs.js

ntc: ntc.nim
	nim c -d:danger --passC:"-flto" ntc

ntcjs.js: ntcjs.nim ntc.nim
	nim js -d:danger ntcjs

