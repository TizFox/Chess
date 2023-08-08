// Start Fen "RNBQKBNR/PPPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr"
/*[
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["r", "n", "b", "q", "k", "b", "n", "r"]
];*/
const nToLetter = {
    1: "a",
    2: "b",
    3: "c",
    4: "d",
    5: "e",
    6: "f",
    7: "g",
    8: "h"
};
const letterToN = {
    "a": 1,
    "b": 2,
    "c": 3,
    "d": 4,
    "e": 5,
    "f": 6,
    "g": 7,
    "h": 8
};
var board = [[], [], [], [], [], [], [], []];

var selectedCell;
var currentPlayerWhite = true;

var whiteCanCastle = { "r": true, "l": true };
var blackCanCastle = { "r": true, "l": true };
var possibleCastleWhiteMove = [];
var possibleCastleBlackMove = [];

var whiteInCheck = false;
var blackInCheck = false;
var whiteKingPos = [0, 4];
var blackKingPos = [7, 4];
var someoneWin = [false, [-1, -1], [-1, -1]];

var possibleFastWhitePawnMove = [];
var possibleFastBlackPawnMove = [];
var lastFastPawnMove = ["P", [-1, -1]];
var enPassantablePawns = [];

function coordinatesToId(coordinates) {
    return `${nToLetter[coordinates[1]+1]}${coordinates[0]+1}` + (isWhite(coordinates[0], coordinates[1]) ? `W` : `B`)
}
function idToCoordinates(id) {
    return [id[1]-1, letterToN[id[0]]-1];
}
function isWhite(i, j) {
    return (i + j) % 2 != 0
}
function isCapital(l) {
    return l === "R" || l === "B" || l === "N" || l === "Q" || l === "K" || l === "P";
}

function createBoard(fen) {
    var i = 0;
    var j = 0;
    for (let k = 0; k < fen.length; k++) {
        let char = fen[k];

        if (char === "1" || char === "2" || char === "3" || char === "4" || char === "5" || char === "6" || char === "7" || char === "8") {
            for (let z = 0; z < char; z++) {
                board[i][j] = " ";
                j += 1;
            }
        } else if (char === "/") {
            i += 1;
            j = 0;
        } else {
            board[i][j] = char;
            j += 1;
        }
        

    }
}

window.onload = function () {
    var fenString = "4K3/R7/8/8/8/4r3/8/4k3";//"RNBQKBNR/PPPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr";
    createBoard(fenString);

    document.body.style.zoom = 0.9;
    loadBoard();
}

function loadBoard() {
    document.getElementById("player").innerHTML = (currentPlayerWhite ? "White" : "Black") + " to Play";

    if (board[whiteKingPos[0]][whiteKingPos[1]] != "K") {
        document.getElementById("who-win").innerHTML = "<h3>Black WIN!</h3>";
        someoneWin = [true, blackKingPos, whiteKingPos];
    } else if (board[blackKingPos[0]][blackKingPos[1]] != "k") {
        document.getElementById("who-win").innerHTML = "<h3>White WIN!</h3>";
        someoneWin = [true, whiteKingPos, blackKingPos];
    } else if (generateAllLegalMoves(board, "K").length === 0) {
        document.getElementById("who-win").innerHTML = "<h3>Black WIN!</h3>";
        someoneWin = [true, blackKingPos, whiteKingPos];
    } else if (generateAllLegalMoves(board, "k").length === 0) {
        document.getElementById("who-win").innerHTML = "<h3>White WIN!</h3>";
        someoneWin = [true, whiteKingPos, blackKingPos];
    }

    for (let i = 0; i < 8; i++) {
        const row = document.getElementById(`${i+1}`);
        row.innerHTML = `<td><h4>${i+1}</h4></td>`;
        for (let j = 0; j < 8; j++) {
            let cellId = coordinatesToId([i, j]);
            let classBtn = isWhite(i, j) ? "white-cell" : "black-cell";
            let img = " "
            if (board[i][j] != " ")
                img = `<img class="piece" src="./assets/${isCapital(board[i][j]) ? "WhitePieces" : "BlackPieces"}/${board[i][j]}.png"></img>`;
            else
            img = `<img class="piece" src="./assets/NULL.png"></img>`;
            row.innerHTML += `<td><button id="${cellId}" class="cell ${classBtn}" onclick="selectCell(${cellId})">${img}</button></td>`;
        }
    }
    if (someoneWin[0]) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let cellId = coordinatesToId([i, j]);
                let cell = document.getElementById(cellId)
                let classBtn = isWhite(i, j) ? "white-sad-cell" : "black-sad-cell";
                if (i === someoneWin[1][0] && j === someoneWin[1][1]) {
                    classBtn = "win-cell";
                } else if (i === someoneWin[2][0] && j === someoneWin[2][1]) {
                    classBtn = "lose-cell";
                }
                cell.onclick = function() {};
                cell.className = `cell ${classBtn}`;
            }
        }
    }
}

function move(b, c, s) {
    var cellCoordinates = idToCoordinates(c);
    var selectedCellCoordinates = idToCoordinates(s);

    // Pawns
    if (b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] === "P") {
        // Promote Pawn
        if (cellCoordinates[0] === 7) {
            var newPiece = "";
            while (newPiece != "Q" && newPiece != "N" && newPiece != "B" && newPiece != "R") {
                newPiece = prompt("Enter the Promoted Piece: (Q, N, B, R)").toUpperCase(); // ---------------------------------------------------------------
            }
            b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] = newPiece;
        }
        // Fast Pawn
        if (possibleFastWhitePawnMove.includes(c)) {
            lastFastPawnMove = [b[selectedCellCoordinates[0]][selectedCellCoordinates[1]], cellCoordinates];
        }
    }
    if (b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] === "p") {
        if (cellCoordinates[0] === 0) {
            var newPiece = "";
            while (newPiece != "q" && newPiece != "n" && newPiece != "b" && newPiece != "r") {
                newPiece = prompt("Enter the Promoted Piece: (q, n, b, r)").toLowerCase(); // ---------------------------------------------------------------
            }
            b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] = newPiece;
        }
        if (possibleFastBlackPawnMove.includes(c)) {
            lastFastPawnMove = [b[selectedCellCoordinates[0]][selectedCellCoordinates[1]], cellCoordinates];
        }
    }

    // --- Eat or Move --- //
    // En Passant
    var include = false;
    for (let i = 0; i < enPassantablePawns.length; i++) {
        if (enPassantablePawns[i][0] === s && enPassantablePawns[i][1] === c) {
            include = true;
        }
    }
    if (include) {
        if (isCapital(b[selectedCellCoordinates[0]][selectedCellCoordinates[1]])) {
            b[cellCoordinates[0]-1][cellCoordinates[1]] = " ";
        } else {
            b[cellCoordinates[0]+1][cellCoordinates[1]] = " ";
        }
    }

    // Check if the Rook Moves
    if (b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] === "r" || b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] === "R") {
        if (selectedCellCoordinates[0] === 0 && selectedCellCoordinates[1] === 0) {
            whiteCanCastle.l = false;
        }
        if (selectedCellCoordinates[0] === 0 && selectedCellCoordinates[1] === 7) {
            whiteCanCastle.r = false;
        }
        if (selectedCellCoordinates[0] === 7 && selectedCellCoordinates[1] === 0) {
            blackCanCastle.l = false;
        }
        if (selectedCellCoordinates[0] === 7 && selectedCellCoordinates[1] === 7) {
            blackCanCastle.r = false;
        }
    }

    // Castle
    if (b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] === "k" || b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] === "K") {
        if (possibleCastleWhiteMove.includes(c)) {
            if (cellCoordinates[0] === 0 && cellCoordinates[1] === 2) {
                b[0][3] = b[0][0];
                b[0][0] = " ";
            }
            if (cellCoordinates[0] === 0 && cellCoordinates[1] === 6) {
                b[0][5] = b[0][7];
                b[0][7] = " ";
            }
        }
        if (possibleCastleBlackMove.includes(c)) {
            if (cellCoordinates[0] === 7 && cellCoordinates[1] === 2) {
                b[7][3] = b[7][0];
                b[7][0] = " ";
            }
            if (cellCoordinates[0] === 7 && cellCoordinates[1] === 6) {
                b[7][5] = b[7][7];
                b[7][7] = " ";
            }
        }
    }

    // Move The Piece
    b[cellCoordinates[0]][cellCoordinates[1]] = b[selectedCellCoordinates[0]][selectedCellCoordinates[1]];
    b[selectedCellCoordinates[0]][selectedCellCoordinates[1]] = " ";
    // Update King Positions
    if (b[cellCoordinates[0]][cellCoordinates[1]] === "K") {
        whiteKingPos[0] = cellCoordinates[0];
        whiteKingPos[1] = cellCoordinates[1];
        whiteCanCastle.l = false;
        whiteCanCastle.r = false;
    } else if (b[cellCoordinates[0]][cellCoordinates[1]] === "k") {
        blackKingPos[0] = cellCoordinates[0];
        blackKingPos[1] = cellCoordinates[1];
        blackCanCastle.l = false;
        blackCanCastle.r = false;
    }

    return [true, b];
}

function selectCell(cell) {
    var cellCoordinates = idToCoordinates(cell.id);
    if (cell.className === "cell white-possible-cell" || cell.className === "cell black-possible-cell") {
        var checkMove = move(board, cell.id, selectedCell);
        if (checkMove[0]) {
            // Update Board
            board = [...checkMove[1]];
            // Change Player
            currentPlayerWhite = ! currentPlayerWhite;
            // Reload The Board
            return loadBoard();
        }
    }

    // Reset Other Cell Color
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            var cellId = coordinatesToId([i, j]);
            var baseclassBtn = cellId[2] === "W" ? "white-cell" : "black-cell";
            var otherCell = document.getElementById(cellId);
            otherCell.className = `cell ${baseclassBtn}`;
        }
    }

    // Play
    if (board[cellCoordinates[0]][cellCoordinates[1]] != " ") {
        if (currentPlayerWhite === isCapital(board[cellCoordinates[0]][cellCoordinates[1]])) {   
            // Set Selected Cell Color
            selectedCell = cell.id;
            var selectedClassBtn = cell.id[2] === "W" ? "white-selected-cell" : "black-selected-cell";
            cell.className = `cell ${selectedClassBtn}`;


            // Set Possible Cell Color
            var moves = filterLegalMoves(board, generateMoves(board, [cellCoordinates[0], cellCoordinates[1]], true), board[cellCoordinates[0]][cellCoordinates[1]]);
            moves.forEach ((m) => {
                var id = m[1];
                var possibleClassBtn = id[2] === "W" ? "white-possible-cell" : "black-possible-cell";
                var cell = document.getElementById(id);
                cell.className = `cell ${possibleClassBtn}`;
            });
        }
    }
}

function isEnemy(piece, enemyPiece) {
    return isCapital(piece) != isCapital(enemyPiece);
}

function checkPieces(b, p, coords) {
    var mustBreak = false;
    var addCoords = false;
    if (coords[0] > 7 || coords[0] < 0 || coords[1] > 7 || coords[1] < 0) {
        return [false, true];
    }
    otherPiece = b[coords[0]][coords[1]];
    if (otherPiece != " ") {
        if (isEnemy(p, otherPiece)) {
            addCoords = true;
        }
        mustBreak = true;
    }
    else
        addCoords = true;
    return [addCoords, mustBreak];
}

function checkPiecesPawes(b, p, coords) {
    var addCoords = false;
    var canEat = false;
    if (coords[0] > 7 || coords[0] < 0 || coords[1] > 7 || coords[1] < 0) {
        return [false, false];
    }
    otherPiece = b[coords[0]][coords[1]];
    if (otherPiece != " ") {
        if (isEnemy(p, otherPiece)) {
            addCoords = true;
            canEat = true;
        }
    }
    else
        addCoords = true;
    return [addCoords, canEat];
}

/*function checkCheckMove(b, m, color) {
    var wKP, bKP;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (b[i][j] === "K") {
                wKP = [i, j];
            } else if (b[i][j] === "k") {
                bKP = [i, j];
            }
        }
    }
    var kingId = coordinatesToId((isCapital(color)) ? wKP : bKP);
    if (m.includes(kingId)) {
        return true;
    }
    return false;
}*/

function checkCheckList(b, m, color) {
    var wKP, bKP;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (b[i][j] === "K") {
                wKP = [i, j];
            } else if (b[i][j] === "k") {
                bKP = [i, j];
            }
        }
    }
    var kingId = coordinatesToId((isCapital(color)) ? wKP : bKP);
    var endMoves = [];
    for (let k = 0; k < m.length; k++) {
        endMoves.push(m[k][1]);
    }
    if (endMoves.includes(kingId)) {
        return true;
    }
    return false;
}


function filterLegalMoves(b, fMs, color) {
    var illegalMoves = [];

    // Crate Test Board
    var testBoard = [];
    for (let i = 0; i < 8; i++) {
        testBoard.push(b[i].slice());
    }

    for (let i = 0; i < fMs.length; i++) {
        var move = fMs[i];
        var startPos = idToCoordinates(move[0]);
        var endPos = idToCoordinates(move[1]);

        testBoard[endPos[0]][endPos[1]] = testBoard[startPos[0]][startPos[1]];
        testBoard[startPos[0]][startPos[1]] = " ";

        // Blacklist the IllegalMove
        var eMs = generateEnemyMoves(testBoard, color); 
        if (checkCheckList(testBoard, eMs, color)) {
            illegalMoves.push(move);
        }
        // Reset
        var testBoard = [];
        for (let i = 0; i < 8; i++) {
            testBoard.push(b[i].slice());
        }
        
    }

    var legalMoves = [];
    for (let i = 0; i < fMs.length; i++) {
        if (!illegalMoves.includes(fMs[i])) {
            legalMoves.push(fMs[i]);
        }
    }
    return legalMoves;
}

function generateMoves(b, coordinates, generateCastle) {
    var m = [];
    var piece = b[coordinates[0]][coordinates[1]];
    var possibleCoordinates = [-1, -1];

    // Torre e Mezza Regina
    if (piece === "r" || piece === "R" || piece === "q" || piece === "Q") {
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0]+i;
            possibleCoordinates[1] = coordinates[1];
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0]-i;
            possibleCoordinates[1] = coordinates[1];
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0];
            possibleCoordinates[1] = coordinates[1]+i;
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0];
            possibleCoordinates[1] = coordinates[1]-i;
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
    }
    // Alfiere e Mezza Regina
    if (piece === "b" || piece === "B" || piece === "q" || piece === "Q") {
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0]+i;
            possibleCoordinates[1] = coordinates[1]+i;
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0]-i;
            possibleCoordinates[1] = coordinates[1]-i;
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0]+i;
            possibleCoordinates[1] = coordinates[1]-i;
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            possibleCoordinates[0] = coordinates[0]-i;
            possibleCoordinates[1] = coordinates[1]+i;
            var check = checkPieces(b, piece, possibleCoordinates);
            if (check[0]) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
            if (check[1]) {
                break;
            }
        }
    }
    // Re
    if (piece === "k" || piece === "K") {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                possibleCoordinates[0] = coordinates[0]+i;
                possibleCoordinates[1] = coordinates[1]+j;
                var check = checkPieces(b, piece, possibleCoordinates);
                if (check[0]) {
                    m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
                }
            }
        }
        
    }
    // Cavallo
    if (piece === "n" || piece === "N") {
        possibleCoordinates[0] = coordinates[0]+1;
        possibleCoordinates[1] = coordinates[1]+2;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        possibleCoordinates[0] = coordinates[0]-1;
        possibleCoordinates[1] = coordinates[1]+2;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        possibleCoordinates[0] = coordinates[0]+1;
        possibleCoordinates[1] = coordinates[1]-2;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        possibleCoordinates[0] = coordinates[0]-1;
        possibleCoordinates[1] = coordinates[1]-2;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }

        possibleCoordinates[0] = coordinates[0]+2;
        possibleCoordinates[1] = coordinates[1]+1;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        possibleCoordinates[0] = coordinates[0]-2;
        possibleCoordinates[1] = coordinates[1]+1;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        possibleCoordinates[0] = coordinates[0]+2;
        possibleCoordinates[1] = coordinates[1]-1;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        possibleCoordinates[0] = coordinates[0]-2;
        possibleCoordinates[1] = coordinates[1]-1;
        var check = checkPieces(b, piece, possibleCoordinates);
        if (check[0]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
    }
    // Pedone
    if (piece === "p" || piece === "P") {
        var checkP;
        var step = isCapital(piece) ? 1 : -1;

        possibleCoordinates[0] = coordinates[0]+step;
        possibleCoordinates[1] = coordinates[1];
        checkP = checkPiecesPawes(b, piece, possibleCoordinates);
        if (checkP[0] && !checkP[1]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            // Fast Start
            if ((coordinates[0] === 6 && !isCapital(piece)) || (coordinates[0] === 1 && isCapital(piece))) {
                possibleCoordinates[0] = coordinates[0]+(step*2);
                possibleCoordinates[1] = coordinates[1];
                checkP = checkPiecesPawes(b, piece, possibleCoordinates);
                if (checkP[0] && !checkP[1]) {
                    m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
                    if (isCapital(piece)) {
                        if (!possibleFastWhitePawnMove.includes(coordinatesToId(possibleCoordinates))) {
                            possibleFastWhitePawnMove.push(coordinatesToId(possibleCoordinates));
                        }
                    }
                    else {
                        if (!possibleFastBlackPawnMove.includes(coordinatesToId(possibleCoordinates))) {
                            possibleFastBlackPawnMove.push(coordinatesToId(possibleCoordinates));
                        }
                    }
                }
            }
        }
        // Diagonal Movement
        var enPassantPiece = lastFastPawnMove[0];
        var enPassantCoords = lastFastPawnMove[1];
        // Eat
        possibleCoordinates[0] = coordinates[0]+step;
        possibleCoordinates[1] = coordinates[1]-1;
        checkP = checkPiecesPawes(b, piece, possibleCoordinates);
        if (checkP[0] && checkP[1]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        // En Passant
        if ((enPassantPiece === "P" && !isCapital(piece)) || (enPassantPiece === "p" && isCapital(piece))) {
            if (enPassantCoords[0] === coordinates[0] && enPassantCoords[1] === coordinates[1]-1) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
                enPassantablePawns.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
        }
        // Eat
        possibleCoordinates[0] = coordinates[0]+step;
        possibleCoordinates[1] = coordinates[1]+1;
        checkP = checkPiecesPawes(b, piece, possibleCoordinates);
        if (checkP[0] && checkP[1]) {
            m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
        }
        // En Passant
        if ((enPassantPiece === "P" && !isCapital(piece)) || (enPassantPiece === "p" && isCapital(piece))) {
            if (enPassantCoords[0] === coordinates[0] && enPassantCoords[1] === coordinates[1]+1) {
                m.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
                enPassantablePawns.push([coordinatesToId(coordinates), coordinatesToId(possibleCoordinates)]);
            }
        }
    }

    // --- Castle --- //
    if (generateCastle && (piece === "k" || piece === "K")) {
        var enemyMoves = generateEnemyMoves(b, piece);
        if (!checkCheckList(b, enemyMoves, piece)) {
            if (piece === "k") {
                possibleCastleBlackMove = [];
                if (blackCanCastle.l) {
                    if (b[7][0] === "r" && b[7][1] === " " && b[7][2] === " " && b[7][3] === " ") {
                        m.push([coordinatesToId(coordinates), coordinatesToId([7, 2])]);
                        possibleCastleBlackMove.push(coordinatesToId([7, 2]));
                    }
                }
                if (blackCanCastle.r) {
                    if (b[7][7] === "r" && b[7][6] === " " && b[7][5] === " ") {
                        m.push([coordinatesToId(coordinates), coordinatesToId([7, 6])]);
                        possibleCastleBlackMove.push(coordinatesToId([7, 6]));
                    }
                }
            }
            if (piece === "K") {
                possibleCastleWhiteMove = [];
                if (whiteCanCastle.l) {
                    if (b[0][0] === "R" && b[0][1] === " " && b[0][2] === " " && b[0][3] === " ") {
                        m.push([coordinatesToId(coordinates), coordinatesToId([0, 2])]);
                        possibleCastleWhiteMove.push(coordinatesToId([0, 2]));
                    }
                }
                if (whiteCanCastle.r) {
                    if (b[0][7] === "R" && b[0][6] === " " && b[0][5] === " ") {
                        m.push([coordinatesToId(coordinates), coordinatesToId([0, 6])]);
                        possibleCastleWhiteMove.push(coordinatesToId([0, 6]));
                    }
                }
            }
        }
    }
    return m;
}

function generateAllLegalMoves(b, color) {
    // Generate all Moves
    var friendlyMoves = generateFriendlyMoves(b, color);
    
    // Find Legal Moves
    legalMoves = filterLegalMoves(b, friendlyMoves, color);
    return legalMoves;
}

function generateFriendlyMoves(b, color) {
    var fM = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (b[i][j] != " " && isCapital(b[i][j]) === isCapital(color)) {
                var moves = generateMoves(b, [i, j], true)
                fM = fM.concat(moves);
            }
        }
    }
    return fM;
}

function generateEnemyMoves(b, color) {
    var eM = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (b[i][j] != " " && isCapital(b[i][j]) != isCapital(color)) {
                var moves = generateMoves(b, [i, j], false)
                eM = eM.concat(moves);
            }
        }
    }
    return eM;
}
