if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/nimTUROCHAMP/sw.js').then(function(reg) {
    console.log('serviceWorker success: ' + reg.scope);
  }).catch(function(error) {
    console.log('serviceWorker error: ' + error);
  });
};

var game = new Chess();
var worker = new Worker('ntcjs.js');

var myvoice = "";
if ('speechSynthesis' in window) {
  var voices = speechSynthesis.getVoices();
  /* for Safari we need to pick an English voice explicitly,
     otherwise the system default is used */
  for (i = 0; i < voices.length; i++) {
    if (voices[i].lang == "en-US") {
      myvoice = voices[i];
      break;
    }
  }
}

function talk(text) {
  if ('speechSynthesis' in window) {
    var msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    msg.pitch = 1;
    msg.rate = 1;
    if (myvoice != "") {
      msg.voice = myvoice;
    }
    window.speechSynthesis.speak(msg);
  }
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
  thefen.innerHTML = game.fen();
  localStorage.setItem("fen", game.fen());
  TUROMove();
}

function TUROMove() {
  var fen = game.fen();
  worker.postMessage(fen);
  thetitle.innerHTML = "is thinking&hellip;";
}

// code by phind.com / GPT-4
function calculateMaterialValue(fen) {
  const pieceValues = {
    'P': 1, // Pawn
    'N': 3, // Knight
    'B': 3.5, // Bishop
    'R': 5, // Rook
    'Q': 10, // Queen
    'K': 1000, // King
    'p': -1, // Pawn
    'n': -3, // Knight
    'b': -3.5, // Bishop
    'r': -5, // Rook
    'q': -10, // Queen
    'k': -1000, // King
  };

  let totalValue = 0;
  const fenParts = fen.split(' ');

  // Extract the piece placement part from the FEN string
  const piecePlacement = fenParts[0];

  // Iterate over each character in the piece placement part
  for (let i = 0; i < piecePlacement.length; i++) {
    const piece = piecePlacement[i];

    // Check if the character represents a piece
    if (piece in pieceValues) {
      // Add the value of the piece to the total
      totalValue += pieceValues[piece];
    }
  }

  return totalValue;
}

// code and many funny quips by phind.com / GPT-4
// additional quips by WizardLM-13B-V1.2 / Redmond Puffin 13B V1.3 / Airoboros l2 7B 2.0
function getQuip(evaluation, side) {
  const genericQuips = [
    "Interesting position!",
    "Oh, is it my turn yet?",
    "Your move. Would you care for a crumpet?",
    "This is getting quite knotty, don't you think?",
    "Ah, the beautiful game of chess… It’s just like cricket but with less running around.",
    "A fine game, this is. Just like life itself: full of surprises and unexpected turns.",
    "You know, this game is rather like cryptanalysis. All about deciphering patterns and making connections…",
    "This game is so full of contradictions. It's chaotic yet methodical, unpredictable yet logical.",
    "Which game are we playing here? Ah right, chess. See, I almost forgot because you took so damn long!",
    "Sure, take your time! It's not like I have anything better to do!",
    "Pheew, this game is already taking longer than cracking the Enigma!",
    "Ah, the beauty of algebraic notation! It makes it so easy to confuse ourselves.",
    "Why did the Pawn go to evening school? Because it wanted to be promoted.",
    "You really don't know what to do in this position, do you?",
    "My goodness, you've got quite an army there! Are you planning to invade Russia?",
    "You have played chess before, haven't you? I'm asking because I sure can't tell!",
    "Just be glad we are not playing against the clock!",
    "It's your move, just in case you haven't noticed!",
    "Wait a second, let me get another cup of tea.",
    "I see your rook and raise you a scone!",
    "I must say, this game has given me quite an appetite. Anybody for a sandwich?",
    "I suppose it's not just about strategy but also patience. Just like waiting for a decent cup of tea to brew!",
    "Just like my mom always said: Chess is like a box of chocolates, you never know which endgame you are going to get.",
    "Is that a castling move or are you just happy to see me?",
    "Would you like a cup of tea? No? Well, I'm having one anyway.",
    "I see you've brought your own teacup. Quite the dedicated little player you are!",
    "Well, it looks like neither one of us understands this position!",
    "I'm as confused by these chess rules as a don by a digital watch.",
    "I've seen faster moves in a game of cricket!",
    "I've seen more strategy in a game of tic-tac-toe!",
    "I've seen more preparation in a hastily made cup of tea!",
    "I've seen more chess knowledge in a beginner's chess club!",
    "I've seen more opening knowledge in a game of checkers!",
    "I've seen more tactical acumen in a game of snakes and ladders!",
    "I've seen more positional understanding in a game of hopscotch!",
    "I've seen more decisive moves in a game of musical chairs!",
    "I've seen better Knight moves at the Queen's birthday parade!",
    "I've seen a more active Bishop at a funeral service!",
    "I've seen more resourceful Queens at the Harrods food counter!",
    "I've seen a more impressive Rook the last time I visited the Tower!",
    "Your Pawns are less organized than a country fair!",
    "Your play is as humdrum as baked beans on toast!",
    "I've seen better chess thinking at a bridge tournament!",
    "Your chess is worse than a cucumber sandwich made by my housekeeper!",
    "Your chess skills are like Tarzan trying to write a novel!",
    "Your play is more depressing than reading obituaries in The Times!",
    "Your moves are less accurate than Big Ben when it's stopped for repairs!",
    "Your brain is like Buckingham Palace: large and mostly empty!",
    "Your moves are as timely as yesterday's newspaper!",
    "Your chess is like a strawberry sherbet without strawberries!",
    "Your chess is like an omelette without eggs!",
    "Your chess is like a ham sandwich without ham!",
    "Your game is like an equation without a solution!",
    "Your intellect is as strong as some soggy Weetabix!",
    "You're as likely to beat me as a penguin is to win a race at Ascot!",
    "Your moves are as exciting as the BBC weather forecast!",
    "Your strategy is as predictable as a foggy day in London!",
    "Your play is about as promising as making a cup of tea in a hurricane!",
    "Your strategies are as doomed as a summer vacation at the South Pole!",
    "Your tactics are about as useful as a fishing rod in the Sahara!",
    "Your game is about as refined as a plate of fish and chips at Buckingham Palace!",
    "Your moves are as slow as molasses in winter!",
    "You're as slippery as a snake in a sock!",
    "To castle or not to castle… That is the question!",
    "I've seen more agility from a damp sponge at a tea dance!",
    "I've seen better strategies in a game of darts at the pub!",
    "Your defense is as porous as a sponge cake in a rainstorm!",
    "Your game is as stale as last week's leftover Yorkshire pudding!",
    "Your moves are as slow as the British Museum on a Monday morning!",
    "Your moves are more old-fashioned than Gilbert and Sullivan!",
    "Your Pawns are more scattered than the leaves in Hyde Park!",
    "Your strategy is as haphazard as the traffic on Oxford Street during rush hour!",
    "Your chess skills are as flat as a pancake!",
    "You are spinning in circles like the London Eye!",
    "Your play is as graceful as a giraffe at a tea party!",
    "Your play is more boring than a Henry James novel!",
    "This game is as predictable as a sunny summer day in Cambridge.",
    "This game is more intricate than an Enigma machine!",
    "Let me grab a toffee and think about this…",
    "It would take Miss Marple to find a killer move for you!",
    "Only Hercule Poirot could solve this difficult case!",
    "(I hope I remembered to lock the front door.)",
    "(Did I leave the oven on? I can almost smell the burnt toast.)",
    "(I must really remember to prepare for tomorrow's lecture.)",
    "(I wonder what my students are up to right now.)",
    "(I could really use a cup of tea right now.)",
    "(I hope my housekeeper remembered to buy more tea.)",
    "(I wonder if it's going to rain today.)",
    "(I should probably start grading those term papers.)",
    "(I wonder if I should ring my housekeeper for some nice tea.)",
  ];

  const winningQuips = [
    "Nice move!",
    "Well played!",
    "You're really crushing it!",
    "You're on fire today!",
    "Amazing play!",
    "Looks like somebody has read a few chess books!",
    "You're unbeatable today!",
    "How about we call it a draw? No?",
    "This position looks messier than my desk.",
    "Guess I should have put less effort into breaking codes and more into learning chess!",
    "Well, well… Cracking the Enigma was a lot easier, that much is certain!",
    "I feel like I'm in a sandwich, and you're the bread.",
    "I'd rather be sipping tea than playing this position.",
    "I'm as tangled as a messy knot in this game!",
    "I suppose I'm a little absent-minded today.",
    "I don't always play this badly!",
    "I say, you really are sneakier than John von Neumann!",
    "Chess is not really my game.",
    "How about we play some cricket instead?",
    "That does not look very promising for me.",
    "I find myself struggling to make a move today. Perhaps I should have had a cup of tea before the game started.",
    "Perhaps I should have brought along some sandwiches for extra brainpower.",
    "I fear my moves today are as stiff as an English gentleman's upper lip!",
    "My apologies for my lackluster performance. Perhaps we could switch to a game of charades?",
    "This game is a bigger bloodshed than an episode of Midsomer Murders!",
    "A horse, a horse, my kingdom for a horse!",
    "Oh, you're very good at this game, aren't you? Better than most people I know!",
    "I must admit, I didn't see that one coming.",
    "I must admit, your strategy is quite brilliant, like a well-executed code break!",
    "You're certainly playing this game with great intensity. One might even say you're immersed in it.",
    "I must be losing my touch. Or perhaps it's just this tea.",
    "Oh well, at least now I have an excuse to drink more tea!",
    "Resign? No, no. Let me finish my crumpet first.",
    "Another checkmate? Oh no, not again!",
  ];

  const losingQuips = [
    "Your position looks murkier than the Thames!",
    "It's no use!",
    "No, that did not work either.",
    "It doesn't look so good for you.",
    "You are going to get blitzed now!",
    "And here comes my clever attack!",
    "Now you are scared, aren't you?",
    "Come on! Even my Manchester Mark 1 can play better than that!",
    "Well that was not such a good move, was it.",
    "Maybe you could call H. G. Wells and loan his time machine?",
    "I could solve the Enigma, you believe this game would be a challenge?",
    "Oh! This victory is almost as refreshing as a cup of English tea!",
    "This game is going smoother than a cricket pitch on a summer's day.",
    "I'm afraid your King is in more trouble than a sandwich at a cricket match.",
    "Chess is like a mathematical puzzle, and I'm the master puzzler!",
    "This game is sweeter than peanut fudge!",
    "My position is more secure than the Tower!",
    "Victory is mine!",
    "This is better than cricket!",
    "What on Earth was that supposed to be?",
    "Ah, another rookie trying to best the master!",
    "Why don't we just call it a day? This game is clearly too one-sided.",
    "Oh, don’t look so distressed! It’s only a game after all.",
    "Well, that was a piece of cake.",
  ];

  const undecidedQuips = [
    "It's a close game.",
    "The outcome seems uncertain.",
    "Anything can happen now!",
    "Tension is in the air!",
    "Well, that looks drawish to me!",
    "Your play is more mysterious than Bletchley Park!",
    "This position is very enigmatic. Like Enigma, you know.",
    "This game is less decidable than the Entscheidungsproblem.",
    "This position has more enigmatic variations than Edward Elgar!",
    "Seems we're stalemated, like two grandmasters, or like my Manchester Mark 1 when I forgot to plug it in.",
    "Is it just me, or is this game starting to look as complicated as artificial intelligence?",
    "This game is as unpredictable as the English weather.",
    "This game is as balanced as a good cup of tea.",
    "I'm in a bit of a pickle, like a crumpet stuck in the toaster!",
    "I'm as undecided as a don trying to choose between tea and coffee.",
    "This game is like a mathematical equation with multiple solutions.",
    "I'm as rumpled as a crumpled piece of paper in this game.",
    "I'm as English as a rainy day, but this game has me in a fog.",
    "The outcome is foggier than Phileas Fogg!",
    "I really haven't the foggiest…",
    "Let me think of a good strategy here…",
    "Decisions, decisions…",
    "This reminds me of those code-breaking days at Bletchley Park. All these possibilities, all these strategies… It's quite fascinating.",
    "It appears we both underestimated each other's strength. A lesson learned today, I suppose.",
  ];
  if (side == "b") {
    evaluation = -evaluation;
  }
  if (Math.random() > .5) {
    return genericQuips[Math.floor(Math.random() * genericQuips.length)];
  }

  if (evaluation > 1) {
    return winningQuips[Math.floor(Math.random() * winningQuips.length)];
  } else if (evaluation < -1) {
    return losingQuips[Math.floor(Math.random() * losingQuips.length)];
  } else {
    return undecidedQuips[Math.floor(Math.random() * undecidedQuips.length)];
  }
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
  thefen.innerHTML = game.fen();
  board.setPosition(game.fen());
  console.log("material balance", calculateMaterialValue(game.fen()));
  let new_quip = getQuip(calculateMaterialValue(game.fen()), game.turn());
  comment.innerHTML = new_quip;
  if (new_quip[0] == "(") {
    balloon.innerHTML = "💭";
    theverb.innerHTML = "thinks";
  } else {
    balloon.innerHTML = "💬";
    theverb.innerHTML = "says";
  }
  localStorage.setItem("fen", game.fen());

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
      var myres = (game.turn() === 'w' ? 'Black' : 'White') + ' has won the game!';
      talk(myres);
    } else {
      talk('The game is a draw.');
    }
  }
  thetitle.innerHTML = "ready";
}

function newgame(){
  game = new Chess();
  spgn.innerHTML = game.pgn();
  thefen.innerHTML = game.fen();
  comment.innerHTML = "Care for another game?";
  balloon.innerHTML = "💬";
  theverb.innerHTML = "says";
  board.setPosition(game.fen());
  localStorage.setItem("fen", game.fen());
}

worker.addEventListener('message', function(e) {
  getmove(e.data);
}, false);

// restore saved game if available
var storedfen = localStorage.getItem("fen");
if (storedfen != null) {
  game = new Chess(storedfen);
  spgn.innerHTML = game.pgn();
  thefen.innerHTML = game.fen();
  board = new ChessBoard('board', {
    fen: storedfen,
    onSquareClick: onSquareClick
  });
} else {
  var board = new ChessBoard('board', {
    onSquareClick: onSquareClick
  });

}
thetitle.innerHTML = "ready";

