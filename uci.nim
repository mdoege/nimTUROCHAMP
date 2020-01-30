## NTC UCI interface

import ntc, strutils

var b: Position
var side = true

proc getgame(x: string): Position =
        ## construct board from startpos moves command, e.g. from Cute Chess
        var b = newgame()
        side = true
        var y = x.split(' ')
        var inv = false
        for i in 3..len(y)-1:
                var fr = parse(y[i][0..1], inv = inv)
                var to = parse(y[i][2..3], inv = inv)
                var c = b.move(fr, to)
                side = not side
                #echo c.board

                var d = c.rotate()
                b = d
                inv = not inv
        return b

proc mirror(x: string): string =
        ## mirror move for Black
        var f1 = char(ord('a') + 7 - (ord(x[0]) - ord('a')))
        var f2 = char(ord('a') + 7 - (ord(x[2]) - ord('a')))
        var r1 = char(ord('1') + 7 - (ord(x[1]) - ord('1')))
        var r2 = char(ord('1') + 7 - (ord(x[3]) - ord('1')))
        return f1 & r1 & f2 & r2

while true:

        var l = readLine(stdin)

        if l == "quit":
                break
        if l == "uci":
                echo "id name nimTUROCHAMP"
                echo "id author Martin C. Doege"
                echo "uciok"
        if l == "isready":
                #b = newgame()
                echo "readyok"
        if l == "ucinewgame" or l == "position startpos":
                b = newgame()
        if l.startsWith("position startpos moves"):
                b = l.getgame()
        if l.startsWith("go"):
                var m = b.getmove()
                if not side:
                        m = m.mirror()        
                echo "bestmove ", m
                
