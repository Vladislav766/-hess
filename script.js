
const board = document.getElementById("board");
const currentTurnDisplay = document.getElementById("current-turn");
const whiteCapturedDisplay = document.getElementById("white-captured");
const blackCapturedDisplay = document.getElementById("black-captured");
const rows = 8;
const cols = 8;
let selectedPiece = null;
let turn = "white";
let whiteCaptured = 0;
let blackCaptured = 0;

function initializeBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
      cell.dataset.row = row;
      cell.dataset.col = col;
      if (row < 3 && (row + col) % 2 !== 0) {
        addPiece(cell, 'black');
      } else if (row > 4 && (row + col) % 2 !== 0) {
        addPiece(cell, 'white');
      }
      cell.addEventListener("click", onCellClick);
      board.appendChild(cell);
    }
  }
}

function onCellClick(e) {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const piece = cell.querySelector('.piece');

  if (selectedPiece) {
    clearHighlights();
    if (canMove(selectedPiece, cell)) {
      movePiece(selectedPiece, cell);
      selectedPiece = null;
    } else {
      selectedPiece.classList.remove('selected');
      selectedPiece = null;
    }
  } else {
    if (piece && piece.dataset.color === turn) {
      selectedPiece = piece;
      selectedPiece.classList.add('selected');
      highlightMoves(selectedPiece);
    }
  }
}

function clearHighlights() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('highlight', 'possible-move');
  });
  document.querySelectorAll('.piece').forEach(piece => {
    piece.classList.remove('selected');
  });
}

function highlightMoves(piece) {
  const startRow = parseInt(piece.parentElement.dataset.row);
  const startCol = parseInt(piece.parentElement.dataset.col);
  const directions = piece.dataset.queen === 'true'
      ? [[1, 1], [1, -1], [-1, -1], [-1, 1]]
      : piece.dataset.color === 'white'
          ? [[-1, 1], [-1, -1]]
          : [[1, 1], [1, -1]];

  directions.forEach(([dr, dc]) => {
    let endRow = startRow + dr;
    let endCol = startCol + dc;

    if (isValidPosition(endRow, endCol)) {
      let targetCell = document.querySelector(`.cell[data-row="${endRow}"][data-col="${endCol}"]`);
      if (!targetCell.querySelector('.piece')) {
        targetCell.classList.add('possible-move');
      } else {
        endRow = startRow + 2 * dr;
        endCol = startCol + 2 * dc;
        if (isValidPosition(endRow, endCol)) {
          const middleCell = document.querySelector(`.cell[data-row="${startRow + dr}"][data-col="${startCol + dc}"]`);
          targetCell = document.querySelector(`.cell[data-row="${endRow}"][data-col="${endCol}"]`);
          const middlePiece = middleCell.querySelector('.piece');
          if (middlePiece && middlePiece.dataset.color !== piece.dataset.color && !targetCell.querySelector('.piece')) {
            targetCell.classList.add('possible-move');
          }
        }
      }
    }
  });
}

function addPiece(cell, color) {
  const piece = document.createElement("div");
  piece.classList.add("piece", color);
  piece.dataset.color = color;
  piece.dataset.queen = 'false';
  cell.appendChild(piece);
}

function canMove(piece, targetCell) {
  const startRow = parseInt(piece.parentElement.dataset.row);
  const startCol = parseInt(piece.parentElement.dataset.col);
  const endRow = parseInt(targetCell.dataset.row);
  const endCol = parseInt(targetCell.dataset.col);
  const direction = piece.dataset.color === 'white' ? -1 : 1;
  const isQueen = piece.dataset.queen === 'true';
  if (targetCell.querySelector('.piece')) {
    return false;
  }

  if (!isQueen) {
    return canMoveRegular(piece, startCol, startRow, endRow, endCol, direction);
  } else {
    return canMoveQueen(piece, startCol, startRow, endRow, endCol);
  }
}

function canMoveRegular(piece, startCol, startRow, endRow, endCol, direction) {
  if (Math.abs(endRow - startRow) === 1 &&
      Math.abs(endCol - startCol) === 1 &&
      endRow - startRow === direction) {
    return true;
  }

  if (Math.abs(endCol - startCol) === 2 &&
      Math.abs(endRow - startRow) === 2 &&
      endRow - startRow === 2 * direction) {
    const middleRow = (startRow + endRow) / 2;
    const middleCol = (startCol + endCol) / 2;
    const middleCell = document.querySelector(
        `.cell[data-row="${middleRow}"][data-col="${middleCol}"]`
    );
    const middlePiece = middleCell.querySelector('.piece');
    if (middlePiece && middlePiece.dataset.color !== piece.dataset.color) {
      return true;
    }
  }
  return false;
}

function canMoveQueen(piece, startCol, startRow, endRow, endCol) {
  const rowDirection = endRow > startRow ? 1 : -1;
  const colDirection = endCol > startCol ? 1 : -1;
  let currentRow = startRow + rowDirection;
  let currentCol = startCol + colDirection;

  while (currentRow !== endRow && currentCol !== endCol) {
    const cell = document.querySelector(
        `.cell[data-row="${currentRow}"][data-col="${currentCol}"]`
    );
    if (cell.querySelector('.piece')) {
      return false;
    }
    currentRow += rowDirection;
    currentCol += colDirection;
  }

  return true;
}

function movePiece(piece, targetCell) {
  const startRow = parseInt(piece.parentElement.dataset.row);
  const startCol = parseInt(piece.parentElement.dataset.col);
  const endRow = parseInt(targetCell.dataset.row);
  const endCol = parseInt(targetCell.dataset.col);

  if (Math.abs(startRow - endRow) === 2 && Math.abs(startCol - endCol) === 2) {
    const middleRow = (startRow + endRow) / 2;
    const middleCol = (startCol + endCol) / 2;
    const middleCell = document.querySelector(
        `.cell[data-row="${middleRow}"][data-col="${middleCol}"]`
    );
    const middlePiece = middleCell.querySelector('.piece');
    if (middlePiece) {
      middleCell.removeChild(middlePiece);
      if (middlePiece.dataset.color === 'white') {
        whiteCaptured++;
        whiteCapturedDisplay.textContent = whiteCaptured;
      } else {
        blackCaptured++;
        blackCapturedDisplay.textContent = blackCaptured;
      }
    }
  }

  targetCell.appendChild(piece);

  if (
      (piece.dataset.color === 'white' && endRow === 0) ||
      (piece.dataset.color === 'black' && endRow === 7)
  ) {
    piece.dataset.queen = 'true';
    piece.classList.add("queen");
  }

  turn = turn === 'white' ? 'black' : 'white';
  currentTurnDisplay.textContent = `Current turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
  selectedPiece = null;
  checkGameState();
}

function checkGameState() {
  let whiteCount = 0;
  let blackCount = 0;
  let whiteHasMoves = false;
  let blackHasMoves = false;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.querySelector(
          `.cell[data-row="${row}"][data-col="${col}"]`
      );
      const piece = cell.querySelector('.piece');

      if (piece) {
        if (piece.dataset.color === 'white') {
          whiteCount++;
          if (!whiteHasMoves && hasValidMoves(piece)) {
            whiteHasMoves = true;
          }
        } else if (piece.dataset.color === 'black') {
          blackCount++;
          if (!blackHasMoves && hasValidMoves(piece)) {
            blackHasMoves = true;
          }
        }
      }
    }
  }
  if (whiteCount === 0 || !whiteHasMoves) {
    alert("Black wins!");
    disableBoard();
  } else if (blackCount === 0 || !blackHasMoves) {
    alert("White wins!");
    disableBoard();
  }
}

function hasValidMoves(piece) {
  const startRow = parseInt(piece.parentElement.dataset.row);
  const startCol = parseInt(piece.parentElement.dataset.col);
  const direction = piece.dataset.queen === 'true'
      ? [[1, 1], [1, -1], [-1, -1], [-1, 1]]
      : piece.dataset.color === 'white'
          ? [[-1, 1], [-1, -1]]
          : [[1, 1], [1, -1]];

  for (let [dr, dc] of direction) {
    const endRow = startRow + dr;
    const endCol = startCol + dc;

    if (isValidPosition(endRow, endCol)) {
      const targetCell = document.querySelector(
          `.cell[data-row="${endRow}"][data-col="${endCol}"]`
      );
      if (!targetCell.querySelector('.piece')) {
        return true;
      }
      const jumpRow = startRow + 2 * dr;
      const jumpCol = startCol + 2 * dc;
      if (isValidPosition(jumpRow, jumpCol)) {
        const middleCell = document.querySelector(
            `.cell[data-row="${endRow}"][data-col="${endCol}"]`
        );
        const jumpCell = document.querySelector(
            `.cell[data-row="${jumpRow}"][data-col="${jumpCol}"]`
        );
        const middlePiece = middleCell.querySelector('.piece');
        if (
            middlePiece &&
            middlePiece.dataset.color !== piece.dataset.color &&
            !jumpCell.querySelector(".piece")
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function isValidPosition(row, col) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function disableBoard() {
  document.querySelectorAll('.cell').forEach((cell) => cell.removeEventListener('click', onCellClick));
}

initializeBoard();





