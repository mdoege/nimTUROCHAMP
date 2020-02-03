# NimTUROCHAMP

A TUROCHAMP implementation in [Nim](https://nim-lang.org/) which uses the [Sunfish](https://github.com/thomasahle/sunfish) move generator and works as an UCI binary. Based on the [pyturochamp.py](https://github.com/mdoege/PyTuroChamp) code.

## Compilation

 nim c -d:release ntc

## UCI parameters

* MAXPLIES: maximum brute-force search depth
* QPLIES: maximum selective search depth

(At the default of MAXPLIES = 2 and QPLIES = 8, there are two brute-force plies and up to six selective plies.)

## License

[GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html)

