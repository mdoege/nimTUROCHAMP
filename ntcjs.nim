## This is a modified version of ntc.nim for compiling to JavaScript.
## The UCI interface has been replaced with fen_to_move
## which accepts a FEN and returns a move.
## The mymove demo lines at the end can be removed after compiling to JS.

import ntc, strutils

proc fen_to_move(fen: string): string =
        var b: Position
        var side = true         # White's turn

        proc getgame_fen(x: string): Position =
                ## construct board from FEN command

                var inv: bool
                var l = x

                let ff = l.split(" ")[2..7]
                let ff2 = ff.join(" ")

                var b = fromfen(ff2)
                if " w " in ff2:
                        side = true
                        inv = false
                else:
                        side = false
                        inv = true

                if len(l.split(" ")) > 8:
                        let mm = l.split(" ")[9..^1]
                        for i in mm:
                                let fr = parse(i[0..1], inv = inv)
                                let to = parse(i[2..3], inv = inv)
                                let c = b.move(fr, to)
                                side = not side

                                let d = c.rotate()
                                b = d
                                inv = not inv
                return b

        b = getgame_fen("position fen " & fen)
        var m = b.getmove()
        if not side: m = m.mirror()
        return m

let mymove = fen_to_move("r4rk1/1pp1npp1/4q3/p1P2b1p/2Q5/P4N2/R2N1PPP/4R1K1 b - - 1 21")

echo mymove

