if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/nimTUROCHAMP/sw.js').then(function(reg) {
    console.log('serviceWorker success: ' + reg.scope);
  }).catch(function(error) {
    console.log('serviceWorker error: ' + error);
  });
};

var game = new Chess();
var board = new ChessBoard('board', {
  onSquareClick: onSquareClick
});
var worker = new Worker('ntcjs.js');

var myvoice = "";
var voices = speechSynthesis.getVoices();
/* for Safari we need to pick an English voice explicitly,
   otherwise the system default is used */
for (i = 0; i < voices.length; i++) {
	if (voices[i].lang == "en-US") {
		myvoice = voices[i];
		break;
	}
}

function talk(text) {
	var msg = new SpeechSynthesisUtterance(text);
	msg.lang = "en-US";
	msg.pitch = 1;
	msg.rate = 1;
	if (myvoice != "") {
		msg.voice = myvoice;
	}
	window.speechSynthesis.speak(msg);
}

function onSquareClick(clickedSquare, selectedSquares) {
  if (selectedSquares.length === 0) {
    if (game.moves({ square: clickedSquare }).length > 0) {
      board.selectSquare(clickedSquare);
    }

    return;
  }

  var selectedSquare = selectedSquares[0];
   
  if (clickedSquare === selectedSquare) {
    board.unselectSquare(clickedSquare);
    return;
  }

  board.unselectSquare(selectedSquare);

  var clickedPieceObject = game.get(clickedSquare);
  var selectedPieceObject = game.get(selectedSquare);

  if (clickedPieceObject && (clickedPieceObject.color === selectedPieceObject.color)) {
    board.selectSquare(clickedSquare);
    return;
  }

  var legalMoves = game.moves({ square: selectedSquare, verbose: true });
  var isMoveLegal = legalMoves.filter(function(move) {
    return move.to === clickedSquare;
  }).length > 0;

  if (!isMoveLegal) {
    return;
  }

  if (selectedPieceObject.type === 'p' && (clickedSquare[1] === '1' || clickedSquare[1] === '8')) { // Promotion
    board.askPromotion(selectedPieceObject.color, function(shortPiece) {
      move(selectedSquare, clickedSquare, shortPiece);
    });
  } else {
    move(selectedSquare, clickedSquare);
  }
}

function move(from, to, promotionShortPiece) {
  game.move({
    from: from,
    to: to,
    promotion: promotionShortPiece
  });

  board.setPosition(game.fen());
  spgn.innerHTML = game.pgn();
  TUROMove();
}

function TUROMove() {
  var fen = game.fen();
  worker.postMessage(fen);
  thetitle.innerHTML = "is thinking&hellip;";
}

function getmove(data) {
  var moves = game.moves({ verbose: true });
	var mymove = "";

	for (j = 0; j < moves.length; j++) {
		if (moves[j].from + moves[j].to == data) {
			mymove = moves[j];
		} else if ((moves[j].from + moves[j].to == data.substring(0, 4)) && moves[j].flags.includes("p")) {
			console.log(moves[j].promotion, data.substring(4, 5));
			if (moves[j].promotion == data.substring(4, 5)) {
				mymove = moves[j];
			}
		}
	}
	if (mymove == "") {
		console.log(data, "illegal move from engine, user wins");
		thetitle.innerHTML = "resigns!";
		talk("I resign!");
		return;
	}
	game.move(mymove);
	spgn.innerHTML = game.pgn();
  board.setPosition(game.fen());

	var pnames = {
		"p": "pawn",
		"n": "knight",
		"b": "bishop",
		"r": "rook",
		"q": "queen",
		"k": "king",
	};
	talk(pnames[mymove.piece] + " from " + mymove.from + " to " + mymove.to + ".");
	if (game.turn() == "w") {
		var sidm = "Black";
	} else {
		var sidm = "White";
	}
	if (mymove.flags.includes("e")) {
		talk("Pawn takes pawn.");
	} else if (mymove.flags.includes("c")) {
		talk(pnames[mymove.piece] + " takes " + pnames[mymove.captured] + ".");
	} else if (mymove.flags.includes("k")) {
		talk(sidm + " castles kingside.");
	} else if (mymove.flags.includes("q")) {
		talk(sidm + " castles queenside.");
	}

	if (game.in_checkmate()) {
		talk("Checkmate!");
	} else if (game.in_check()) {
		talk("Check!");
	}

  if (game.game_over()) {
    if (game.in_checkmate()) {
      var myres = 'You have ' + (game.turn() === 'w' ? 'lost' : 'won') + ' the game!';
      talk(myres);
    } else {
      talk('The game is a draw.');
    }
  }
  thetitle.innerHTML = "ready";
}

worker.addEventListener('message', function(e) {
	getmove(e.data);
}, false);

thetitle.innerHTML = "ready";

