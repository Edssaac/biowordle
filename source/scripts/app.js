const MAX_LETTER_PER_ROW = 5;
const MAX_ATTEMPTS = 6;

const KEY_BACKSPACE = 'Backspace';
const KEY_ENTER = 'Enter';
const KEY_DELETE = 'Delete';

const GRAY_COLOR_HEXADECIMAL = '#585858';
const YELLOW_COLOR_HEXADECIMAL = '#B59F3B';
const GREEN_COLOR_HEXADECIMAL = '#538D4E';

const TOASTIFY_SUCCESS_COLOR = '#538D4E';
const TOASTIFY_ERROR_COLOR = '#BA4747';
const TOASTIFY_WARNING_COLOR = '#B59F3B';

const NOTIFICATION_EMPTY_GUESS = 'Digite uma palavra!';
const NOTIFICATION_INCOMPLETE_GUESS = 'Preencha todas as letras!';
const NOTIFICATION_WORD_NOT_IN_DATABASE = 'Palavra não listada';
const NOTIFICATION_GAME_OVER_GUESS_RIGHT = 'Parabéns, você acertou!';
const NOTIFICATION_REACH_MAX_ATTEMPTS = 'Infelizmente não foi dessa vez';

const NOTIFICATION_DISPLAY_LETTER_SUCCESSFULLY = 'Showing letter with success';
const NOTIFICATION_BACKSPACE_KEY_PRESSED = 'Backspace key pressed';
const NOTIFICATION_BACKSPACE_WHEN_EMPTY_GUESS = 'Could not erase when is an empty guess';
const NOTIFICATION_ENTER_KEY_PRESSED = 'Enter key pressed';
const NOTIFICATION_INVALID_PRESSED_KEY = 'Invalid Pressed Key';
const NOTIFICATION_REACH_MAX_LETTERS_PER_ROW = 'Reach Max letter per row';

const gameInitialConfig = {
    database: [],
    currentRow: 1,
    currentLetterPosition: 1,
    currentGuess: '',
    rightGuess: '',
    active: true,
}

const toastifyDefaultConfig = {
    duration: 2000,
    newWindow: true,
    close: true,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
        boxShadow: "1px 3px 10px 0px #585858"
    },
    offset: {
        x: 0, 
        y: 75 
    }
}

const drawnBoard = () => {
    const board = document.querySelector('.board-game');
    var positions = '';

    for (let row = 1; row <= MAX_ATTEMPTS; row++) {
        positions += `<div class="k-row k-row-${row}">`;

        for (let column = 1; column <= MAX_LETTER_PER_ROW; column++) {
            positions += `<div class="letter letter-${column}"></div>`;
        }

        positions += '</div>';
    }

    board.innerHTML = positions;
}

const getOneRandomWord = (wordsList) => {
    const countWords = wordsList.length;
    const shuffleIndex = Math.floor(Math.random() * countWords);
    
    document.getElementById("hint-text").innerText = wordsList[shuffleIndex].meaning;

    return wordsList[shuffleIndex].word.toLowerCase();
}

const showNotification = ({ background, message }) => {
    Toastify({ ...toastifyDefaultConfig, text: message, background }).showToast();
}

const showPlayAgainButton = () => {
    const buttonPlayAgain = document.querySelector('.play-again .btn-play-again');
    buttonPlayAgain.style.display = 'block';
}

const hidePlayAgainButton = () => {
    const buttonPlayAgain = document.querySelector('.btn-play-again');
    buttonPlayAgain.style.display = 'none';
}

const resetInitialGame = (game) => {
    game.rightGuess = getOneRandomWord(game.database);
    game.currentRow = 1;
    game.currentLetterPosition = 1;
    game.currentGuess = '';
    game.active = true;
}

const resetBoardGameLetter = () => {
    document.querySelectorAll('.board-game .k-row .letter').forEach((element) => {
        element.textContent = '';
        element.style.background = '';
    })
}

const resetKeyboardLetter = () => {
    document.querySelectorAll('.keyboard .k-row .letter').forEach((element) => {
        element.style.background = '';
    })
}

const getGameBoardLetter = (currentRow, currentLetterPosition) => {
    return document.querySelector(`.board-game .k-row-${currentRow} .letter-${currentLetterPosition}`);
}

const isBackspaceKeyPressed = (pressedKey) => {
    return [KEY_BACKSPACE, KEY_DELETE].includes(pressedKey);
}

const isEnterKeyPressed = (pressedKey) => {
    return pressedKey === KEY_ENTER;
}

const isOneAlphabeticLetter = (pressedKey) => {
    return pressedKey.length === 1 && /[A-Za-z]/.test(pressedKey);
}

const isValidKeyPressed = (pressedKey) => {
    return isEnterKeyPressed(pressedKey)
        || isBackspaceKeyPressed(pressedKey)
        || isOneAlphabeticLetter(pressedKey)
}

const isGuessInDatabase = (guess, database) => {
    for (let i = 0; i < database.length; i++) {
        if (database[i].word === guess) {
            return true;
        }
    }

    return false;
}

const isCurrentGuessEmpty = (currentGuess) => {
    return currentGuess === '';
}

const isCorrectGuess = (currentGuess, rightGuess) => {
    return rightGuess.toLowerCase() === currentGuess.toLowerCase();
}

const isLetterInRightGuess = (letter, rightGuess) => {
    const letterPosition = rightGuess.indexOf(letter);
    return letterPosition > -1;
}

const isLettersEqualsInSamePosition = (position, currentGuess, rightGuess) => {
    return currentGuess[position] === rightGuess[position];
}

const reachMaxLetterPerRow = (currentLetterPosition) => {
    return currentLetterPosition > MAX_LETTER_PER_ROW;
}

const reachMaxAttempts = (currentRow) => {
    return currentRow > MAX_ATTEMPTS;
}

const applyColor = (element, color) => {
    element.style.background = color;
}

const displayColor = (game) => {
    const { currentGuess, currentRow, rightGuess } = game;
    const row = document.querySelector(`.k-row-${currentRow}`);

    for (let position = 0; position < currentGuess.length; position++) {
        const box = row.querySelector(`.letter-${position + 1}`);
        const letter = currentGuess[position];
        const letterBox = document.querySelector(`.letter-${letter}`);

        if (!isLetterInRightGuess(letter, rightGuess)) {
            applyColor(box, GRAY_COLOR_HEXADECIMAL);
            applyColor(letterBox, GRAY_COLOR_HEXADECIMAL);
            continue;
        }

        if (isLettersEqualsInSamePosition(position, currentGuess, rightGuess)) {
            applyColor(box, GREEN_COLOR_HEXADECIMAL);
            applyColor(letterBox, GREEN_COLOR_HEXADECIMAL);
            continue;
        }

        applyColor(box, YELLOW_COLOR_HEXADECIMAL);
        applyColor(letterBox, YELLOW_COLOR_HEXADECIMAL);
    }
}

const removeLastLetter = (currentGuess) => {
    return currentGuess.slice(0, currentGuess.length - 1)
}

const removeLetterFromBoard = (game) => {
    const { currentGuess, currentRow, currentLetterPosition } = game;

    game.currentGuess = removeLastLetter(currentGuess);
    game.currentLetterPosition--;

    const element = getGameBoardLetter(currentRow, currentLetterPosition - 1);
    element.textContent = '';

    return NOTIFICATION_BACKSPACE_KEY_PRESSED;
}

const displayLetterOnTheBoard = (game, pressedKey) => {
    const { currentRow, currentLetterPosition } = game;
    const element = getGameBoardLetter(currentRow, currentLetterPosition);

    element.textContent = pressedKey;

    game.currentGuess += pressedKey;
    game.currentLetterPosition++;

    return NOTIFICATION_DISPLAY_LETTER_SUCCESSFULLY;
}

const nextGuess = (game) => {
    game.currentRow++;
    game.currentGuess = '';
    game.currentLetterPosition = 1;

    if (reachMaxAttempts(game.currentRow)) {
        showNotification({ message: NOTIFICATION_REACH_MAX_ATTEMPTS, background: TOASTIFY_ERROR_COLOR });
        showPlayAgainButton();
    }

    return NOTIFICATION_ENTER_KEY_PRESSED;
}

const checkGuess = (game) => {
    const { database, currentLetterPosition, currentGuess, rightGuess } = game;

    if (isCurrentGuessEmpty(currentGuess)) {
        return showNotification({ message: NOTIFICATION_EMPTY_GUESS, background: TOASTIFY_ERROR_COLOR });
    }

    if (!reachMaxLetterPerRow(currentLetterPosition)) {
        return showNotification({ message: NOTIFICATION_INCOMPLETE_GUESS, background: TOASTIFY_WARNING_COLOR });
    }

    if (!isGuessInDatabase(currentGuess, database)) {
        return showNotification({ message: NOTIFICATION_WORD_NOT_IN_DATABASE, background: TOASTIFY_WARNING_COLOR });
    }

    if (isCorrectGuess(currentGuess, rightGuess)) {
        game.active = false;
        displayColor(game);
        showPlayAgainButton();
        return showNotification({ message: NOTIFICATION_GAME_OVER_GUESS_RIGHT, background: TOASTIFY_SUCCESS_COLOR });
    }

    displayColor(game);

    return nextGuess(game);
}

const onKeyPressed = (pressedKey, game) => {
    if (pressedKey == undefined || !game.active) {
        return;
    }

    const { currentLetterPosition, currentGuess, currentRow } = game;

    if (reachMaxAttempts(currentRow)) {
        return false;
        // return showNotification({ message: NOTIFICATION_REACH_MAX_ATTEMPTS, background: TOASTIFY_ERROR_COLOR });
    }

    if (!isValidKeyPressed(pressedKey)) {
        return false;
        // return showNotification({ message: NOTIFICATION_INVALID_PRESSED_KEY, background: TOASTIFY_ERROR_COLOR });
    }

    if (isBackspaceKeyPressed(pressedKey) && !isCurrentGuessEmpty(currentGuess)) {
        return removeLetterFromBoard(game);
    }

    if (isBackspaceKeyPressed(pressedKey) && isCurrentGuessEmpty(currentGuess)) {
        return false;
        // return showNotification({ message: NOTIFICATION_BACKSPACE_WHEN_EMPTY_GUESS, background: TOASTIFY_WARNING_COLOR });
    }

    if (isEnterKeyPressed(pressedKey)) {
        return checkGuess(game);
    }

    if (reachMaxLetterPerRow(currentLetterPosition)) {
        return false;
        // return showNotification({ message: NOTIFICATION_REACH_MAX_LETTERS_PER_ROW, background: TOASTIFY_ERROR_COLOR });
    }

    return displayLetterOnTheBoard(game, pressedKey);
}

const onEnterButtonPressed = (game) => {
    document.querySelector('.action.enter')
        .addEventListener('click', () => onKeyPressed('Enter', game));
}

const onEraseButtonPressed = (game) => {
    document.querySelector('.action.erase')
        .addEventListener('click', (event) => {
            event.stopPropagation();
            onKeyPressed('Backspace', game);
        });
}

const onLetterButtonPressed = (game) => {
    document.querySelectorAll('.letter').forEach((element) => {
        element.addEventListener('click', (event) => {
            onKeyPressed(event.target.value, game);
            element.blur();
        })
    })
}

const onPlayAgainButtonPressed = (game) => {
    const buttonPlayAgain = document.querySelector('.btn-play-again')

    buttonPlayAgain.addEventListener('click', () => {
        resetInitialGame(game);
        resetBoardGameLetter();
        resetKeyboardLetter();
        hidePlayAgainButton();
    })
}

const onKeydown = (game) => {
    document.addEventListener('keydown', (event) => onKeyPressed(event.key, game));
}

const loadWords = async () => {
    return fetch('./source/assets/json/database.json')
        .then((response) => response.json())
        .then(({ words }) => words)
        .catch(() => []);
}

const start = () => {
    window.onload = async () => {
        drawnBoard();

        const database = await loadWords();
        const rightGuess = getOneRandomWord(database);

        const game = { ...gameInitialConfig, database, rightGuess }

        console.log(database)
        console.log('get one random word: ', rightGuess);

        onKeydown(game);
        onLetterButtonPressed(game);
        onEnterButtonPressed(game);
        onEraseButtonPressed(game);
        onPlayAgainButtonPressed(game);
    }
}

start();