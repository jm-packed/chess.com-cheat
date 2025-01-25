// ==UserScript==
// @name         Chess.com Stockfish Move Helper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show Stockfish moves and auto-move on Chess.com
// @author       YourName
// @include      https://www.chess.com/*
// @grant        none
// @require      https://cdn.jsdelivr.net/gh/lichess-org/stockfish/stockfish.wasm.js
// @run-at       document-idle
// ==/UserScript==

(async function () {
    'use strict';

    // Load Stockfish
    const stockfish = new Worker('https://cdn.jsdelivr.net/gh/lichess-org/stockfish/stockfish.wasm.js');
    let bestMove = '';

    stockfish.onmessage = (event) => {
        if (event.data.startsWith('bestmove')) {
            bestMove = event.data.split(' ')[1];
            updateBestMoveDisplay(`Best Move: ${bestMove}`);
        }
    };

    function sendCommand(cmd) {
        stockfish.postMessage(cmd);
    }

    function getMoves() {
        const moves = [];
        document.querySelectorAll('.move-text-component').forEach((move) => {
            moves.push(move.textContent.trim());
        });
        return moves.join(' ');
    }

    function updateBestMoveDisplay(text) {
        const display = document.getElementById('stockfish-display');
        if (display) {
            display.textContent = text;
        }
    }

    function autoMove() {
        if (!bestMove) {
            alert('No best move calculated yet!');
            return;
        }

        const from = bestMove.slice(0, 2);
        const to = bestMove.slice(2, 4);

        const board = document.querySelector('.board');
        if (!board) return;

        const squares = board.querySelectorAll('.square');
        const fromSquare = Array.from(squares).find((square) => square.dataset.square === from);
        const toSquare = Array.from(squares).find((square) => square.dataset.square === to);

        if (fromSquare && toSquare) {
            fromSquare.click();
            toSquare.click();
        } else {
            alert('Auto-move failed. Ensure you’re playing a valid game.');
        }
    }

    function createUI() {
        const container = document.createElement('div');
        container.id = 'stockfish-ui';
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.right = '10px';
        container.style.background = 'white';
        container.style.border = '1px solid black';
        container.style.padding = '10px';
        container.style.zIndex = 10000;

        const analyzeButton = document.createElement('button');
        analyzeButton.textContent = 'Analyze Position';
        analyzeButton.style.display = 'block';
        analyzeButton.style.marginBottom = '10px';
        analyzeButton.onclick = () => {
            const moves = getMoves();
            sendCommand('position startpos moves ' + moves);
            sendCommand('go depth 15');
        };
        container.appendChild(analyzeButton);

        const autoMoveButton = document.createElement('button');
        autoMoveButton.textContent = 'Auto-Move';
        autoMoveButton.style.display = 'block';
        autoMoveButton.onclick = autoMove;
        container.appendChild(autoMoveButton);

        const bestMoveDisplay = document.createElement('div');
        bestMoveDisplay.id = 'stockfish-display';
        bestMoveDisplay.style.marginTop = '10px';
        bestMoveDisplay.textContent = 'Best Move: N/A';
        container.appendChild(bestMoveDisplay);

        document.body.appendChild(container);
    }

    sendCommand('uci');
    createUI();
})();