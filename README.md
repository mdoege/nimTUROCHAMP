# NimTUROCHAMP

![screenshot](https://github.com/mdoege/nimTUROCHAMP/raw/master/ntc.png "NimTUROCHAMP screenshot")

A TUROCHAMP implementation in [Nim](https://nim-lang.org/) which uses the [Sunfish](https://github.com/thomasahle/sunfish) move generator and works as an UCI binary. Based on the [pyturochamp.py](https://github.com/mdoege/PyTuroChamp) code.

Here is a [web browser-based demo](https://mdoege.github.io/nimTUROCHAMP/) of nimTUROCHAMP built with "nim js".

## Compilation

 nim c -d:release --passC:"-flto" ntc

## UCI parameters

* MAXPLIES: maximum brute-force search depth
* QPLIES: maximum selective search depth

(At the default of MAXPLIES = 2 and QPLIES = 8, there are two brute-force plies and up to six selective plies.)

## License

[GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html)

