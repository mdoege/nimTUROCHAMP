# nimTUROCHAMP

import tables, strutils
from strformat import fmt

const
        A1 = 91
        H1 = 98
        A8 = 21
        H8 = 28
        ini =  ("         \n"  &
                "         \n"  &
                " rnbqkbnr\n"  &
                " pppppppp\n"  &
                " ........\n"  &
                " ........\n"  &
                " ........\n"  &
                " ........\n"  &
                " PPPPPPPP\n"  &
                " RNBQKBNR\n"  &
                "         \n"  &
                "         \n"
        )
        N = -10
        E = 1
        S = 10
        W = -1
        dirs = to_table({'P': [N, N+N, N+W, N+E, 0, 0, 0, 0],
        'N': [N+N+E, E+N+E, E+S+E, S+S+E, S+S+W, W+S+W, W+N+W, N+N+W],
        'B': [N+E, S+E, S+W, N+W, 0, 0, 0, 0],
        'R': [N, E, S, W, 0, 0, 0, 0],
        'Q': [N, E, S, W, N+E, S+E, S+W, N+W],
        'K': [N, E, S, W, N+E, S+E, S+W, N+W]
        })
        piece = to_table({ 'P': 1.0, 'N': 3.0, 'B': 3.5, 'R': 5.0, 'Q': 10.0, 'K': 1000.0 })

type Position = object
        board: string
        score: float
        wc_w : bool
        wc_e : bool
        bc_w : bool
        bc_e : bool
        ep : int
        kp : int
        
var b = Position(board: ini, score: 0, wc_w: true, wc_e: true, bc_w: true, bc_e: true, ep: 0, kp: 0)

proc render(x: int) : string =
        var r : int = int((x - A8) / 10)
        var f : int = (x - A8) mod 10

        result = fmt"{char(f + ord('a'))}{8 - r}"
                        
proc gen_moves(s: Position) : seq[(int, int)] =
        for i in 0..119:
                var p = s.board[i]
                if not p.isUpperAscii():
                        continue
                #echo i, " ", render(i)
                for d in dirs[p]:
                        if d == 0:
                                break
                        var j = i + d
                        while true:
                                #echo render(j)
                                var q = s.board[j]
                                if q.isSpaceAscii() or q.isUpperAscii():
                                        break
                                if p == 'P' and d in [N, N+N] and q != '.':
                                        break
                                if p == 'P' and d == N+N and (i < A1+N or s.board[i+N] != '.'):
                                        break
                                if p == 'P' and d in [N+W, N+E] and q == '.' and not (j in [s.ep, s.kp, s.kp-1, s.kp+1]):
                                        break
                                result.add((i, j))
                                if p == 'P' or p == 'N' or p == 'K' or q.isLowerAscii():
                                        break
                                if i == A1 and s.board[j+E] == 'K' and s.wc_w:
                                        result.add((j+E, j+W))
                                if i == H1 and s.board[j+W] == 'K' and s.wc_e:
                                        result.add((j+W, j+E))
                                j = j + d

var moves = gen_moves(b)

for i in 0..len(moves)-1:
        var fr = render(moves[i][0])
        var to = render(moves[i][1])
        echo i+1, " ", fr, to


