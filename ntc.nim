## nimTUROCHAMP

import tables, strutils, times, algorithm, math
from strformat import fmt
from unicode import reversed, swapCase

const
        A1 = 91
        H1 = 98
        A8 = 21
        H8 = 28
        ini = ( "         \n" &
                "         \n" &
                " rnbqkbnr\n" &
                " pppppppp\n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                " PPPPPPPP\n" &
                " RNBQKBNR\n" &
                "         \n" &
                "         \n"
        )
        emp = ( "         \n" &
                "         \n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                " ........\n" &
                "         \n" &
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
        piece = to_table({'P': 1.0, 'N': 3.0, 'B': 3.5, 'R': 5.0, 'Q': 10.0, 'K': 1000.0})

var
        MAXPLIES = 4
        NODES = 0

type Position* = object
        board*: string
        score*: float
        wc_w*: bool
        wc_e*: bool
        bc_w*: bool
        bc_e*: bool
        ep*: int
        kp*: int

proc render*(x: int): string =
        ## convert index to square name
        var r: int = int((x - A8) / 10)
        var f: int = (x - A8) mod 10

        result = fmt"{char(f + ord('a'))}{8 - r}"

proc parse*(c: string, inv = false): int =
        ## convert square name to index
        var f = ord(c[0]) - ord('a')
        var r = ord(c[1]) - ord('1')
        if inv:
                f = 7 - f
                r = 7 - r
        #echo f, " ", r
        return A1 + f - 10 * r

proc newgame*(): Position =
        ## create a new board in the starting position
        Position(board: ini, score: 0, wc_w: true, wc_e: true,
                bc_w: true, bc_e: true, ep: 0, kp: 0) 

var b = newgame()

proc put(board: string, at: int, piece: char): string =
        ## put piece at board location
        return board[0..at-1] & piece & board[at+1..119]

proc rotate*(s: Position): Position =
        ## rotate board for other player's turn
        var ep = 0
        var kp = 0
        if s.ep > 0:
                ep = 119 - s.ep
        if s.kp > 0:
                kp = 119 - s.kp
        return Position(board: s.board.reversed.swapCase(),
                score: -s.score, wc_w: s.bc_w, wc_e: s.bc_e, bc_w: s.wc_w, bc_e: s.wc_e,
                ep: ep, kp: kp)

proc fromfen*(fen: string): Position =
        ## accept a FEN and return a board
        var b = emp

        var f = fen.split(" ")[0]
        var cas = fen.split(" ")[2]
        var enpas = fen.split(" ")[3]

        var i = 0
        var j = 0

        for x in f:
                var a = ord(x)
                if (a > 48) and (a < 57):
                        i = i + (a - 48)
                elif a == 47:
                        i = 0
                        inc j
                else:
                        b[A8 + 10*j + i] = x
                        inc i

        var ep = 0
        if enpas != "-":
                ep = parse(enpas)

        var pos = Position(board: b, score: 0, wc_w: cas.contains('Q'), wc_e: cas.contains('K'),
                        bc_w: cas.contains('K'), bc_e: cas.contains('Q'), ep: ep, kp: 0)

        if fen.split(" ")[1] == "b":
                pos = pos.rotate()
        return pos

proc gen_moves*(s: Position): seq[(int, int)] =
        ## generate all pseudo-legal moves in a position
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
                                if p == 'P' and d == N+N and (i < A1+N or
                                                s.board[i+N] != '.'):
                                        break
                                if p == 'P' and d in [N+W, N+E] and q == '.' and
                                                not (j in [s.ep, s.kp, s.kp-1, s.kp+1]):
                                        break
                                result.add((i, j))
                                if p == 'P' or p == 'N' or p == 'K' or
                                                q.isLowerAscii():
                                        break
                                if i == A1 and s.board[j+E] == 'K' and s.wc_w:
                                        result.add((j+E, j+W))
                                if i == H1 and s.board[j+W] == 'K' and s.wc_e:
                                        result.add((j+W, j+E))
                                j = j + d

proc value(s: Position, fr: int, to: int): float =
        ## compute score difference due to given move
        let
                p = s.board[fr]
                q = s.board[to]
        if q.isLowerAscii():
                result += piece[q.toUpperAscii()]
        if p == 'P':
                if (A8 <= to) and (to <= H8):
                        result += piece['Q'] - piece['P']
                if to == s.ep:
                        result += piece['P']

proc move*(s: Position, fr: int, to: int): Position =
        ## carry out a move on the board
        let
                p = s.board[fr]
                q = s.board[to]
        var
                board = s.board
                score = s.score + s.value(fr, to)
                wc_w = s.wc_w
                wc_e = s.wc_e
                bc_w = s.bc_w
                bc_e = s.bc_e
                ep = 0
                kp = 0
        board = put(board, to, board[fr])
        board = put(board, fr, '.')
        if fr == A1: wc_w = false
        if fr == H1: wc_e = false
        if to == A8: bc_e = false
        if to == H8: bc_w = false

        if p == 'K':
                wc_w = false
                wc_e = false
                if abs(to - fr) == 2:
                        kp = int((to + fr) / 2)
                        if to < fr:
                                board = put(board, A1, '.')
                        else:
                                board = put(board, H1, '.')
                        board = put(board, kp, 'R')

        if p == 'P':
                if (A8 <= to) and (to <= H8):
                        board = put(board, to, 'Q')
                if to - fr == 2*N:
                        ep = fr + N
                if to == s.ep:
                        board = put(board, to+S, '.')

        return Position(board: board, score: score,
                wc_w: wc_w, wc_e: wc_e, bc_w: bc_w, bc_e: bc_e, ep: ep, kp: kp)

proc searchmax(b: Position, ply: int, alpha: float, beta: float): float =
        ## Negamax search function
        inc NODES
        if ply >= MAXPLIES:
                return b.score

        var moves = gen_moves(b)
        var al = alpha
        for i in 0..len(moves)-1:
                var c = b.move(moves[i][0], moves[i][1])
                var d = c.rotate()
                var t = searchmax(d, ply + 1, -beta, -al)
                t = -t
                if t >= beta:
                        return beta
                if t > al:
                        al = t
        return al

proc myCmp(x, y: tuple): int =
        if x[0] > y[0]: -1 else: 1

proc isblack(pos: Position): bool =
        ## is it Black's turn?
        if pos.board.startsWith('\n'): true else: false

proc attacks*(pos: Position, x: int): seq[int] =
        ## return attacked empty and enemy squares
        var moves = pos.gen_moves()
        for (i, j) in moves:
                if i == x:
                        result.add(j)

proc turing(s: Position): float =
        ## evaluate Turing positional criteria
        for i in 0..119:
                var p = s.board[i]
                var tt: float
                if not p.isUpperAscii():
                        continue
                        
                # piece mobility
                if p != 'P':
                        var a = s.attacks(i)
                        if len(a) > 0:
                                for j in a:
                                        if s.board[j] == '.':
                                                tt += 1
                                        else:
                                                tt += 2
                        result += sqrt(tt)
                
                # King safety
                if p == 'K':
                        var ks = Position(board: s.board, score: s.score,
                                        wc_w: s.wc_w, wc_e: s.wc_e,
                                        bc_w: s.bc_w, bc_e: s.bc_e, ep: s.ep, kp: s.kp)
                        tt = 0
                        ks.board[i] = 'Q'
                        var ka = ks.attacks(i)
                        if len(ka) > 0:
                                for j in ka:
                                        if s.board[j] == '.':
                                                tt += 1
                                        else:
                                                tt += 2
                        result -= sqrt(tt)

proc getmove*(b: Position): string =
        ## get computer move for board position
        NODES = 0
        var start = epochTime()
        var moves = gen_moves(b)
        var ll: seq[(float, string, string, int, int)]
                
        for i in 0..len(moves)-1:
                var fr = render(moves[i][0])
                var to = render(moves[i][1])
                var c = b.move(moves[i][0], moves[i][1])
                var d = c.rotate()
                var t = searchmax(d, 1, -1e6, 1e6)
                t = -t
                #echo fr, to, " ", t, " ", c.turing()
                ll.add((t + c.turing() / 1000.0, fr, to, moves[i][0], moves[i][1]))

        ll.sort(myCmp)

        var diff = epochTime() - start

        var c = b.move(ll[0][3], ll[0][4])
        echo fmt"info depth {MAXPLIES} score cp {int(100*ll[0][0])} time {int(1000*diff)} nodes {NODES}"
        return ll[0][1] & ll[0][2]


