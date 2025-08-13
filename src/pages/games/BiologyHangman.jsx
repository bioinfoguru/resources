// src/components/BiologyHangman.jsx
import { createSignal, onMount, onCleanup } from 'solid-js';
import { render } from 'solid-js/web';

const BiologyHangman = () => {
  // Game state
  const [gameState, setGameState] = createSignal('menu'); // menu, playing, gameOver
  const [word, setWord] = createSignal('');
  const [guessedLetters, setGuessedLetters] = createSignal([]);
  const [incorrectGuesses, setIncorrectGuesses] = createSignal(0);
  const [maxIncorrectGuesses] = createSignal(6);
  const [hint, setHint] = createSignal('');
  const [category, setCategory] = createSignal('');
  const [showHint, setShowHint] = createSignal(false);
  
  // Biology words with hints and categories
  const biologyWords = [
    { word: 'MITOCHONDRIA', hint: 'The powerhouse of the cell', category: 'Cell Biology' },
    { word: 'PHOTOSYNTHESIS', hint: 'Process by which plants make food', category: 'Botany' },
    { word: 'ECOSYSTEM', hint: 'A community of living organisms', category: 'Ecology' },
    { word: 'CHROMOSOME', hint: 'Structure containing genetic information', category: 'Genetics' },
    { word: 'EVOLUTION', hint: 'Change in species over time', category: 'Evolutionary Biology' },
    { word: 'OSMOSIS', hint: 'Movement of water through a membrane', category: 'Cell Biology' },
    { word: 'ENZYME', hint: 'Protein that speeds up chemical reactions', category: 'Biochemistry' },
    { word: 'NUCLEUS', hint: 'Control center of the cell', category: 'Cell Biology' },
    { word: 'MEMBRANE', hint: 'Outer boundary of a cell', category: 'Cell Biology' },
    { word: 'VIRUS', hint: 'Infectious agent that replicates inside cells', category: 'Microbiology' },
    { word: 'BACTERIA', hint: 'Single-celled prokaryotic organisms', category: 'Microbiology' },
    { word: 'FUNGI', hint: 'Kingdom of organisms that includes mushrooms', category: 'Microbiology' },
    { word: 'PROTEIN', hint: 'Macromolecule made of amino acids', category: 'Biochemistry' },
    { word: 'CARBOHYDRATE', hint: 'Sugar-based molecule providing energy', category: 'Biochemistry' },
    { word: 'LIPID', hint: 'Hydrophobic molecule including fats', category: 'Biochemistry' },
    { word: 'DNA', hint: 'Molecule containing genetic instructions', category: 'Genetics' },
    { word: 'RNA', hint: 'Molecule involved in protein synthesis', category: 'Genetics' },
    { word: 'GENE', hint: 'Unit of heredity', category: 'Genetics' },
    { word: 'ALLELE', hint: 'Variant form of a gene', category: 'Genetics' },
    { word: 'MUTATION', hint: 'Change in genetic sequence', category: 'Genetics' },
    { word: 'NATURAL SELECTION', hint: 'Mechanism of evolution', category: 'Evolutionary Biology' },
    { word: 'ADAPTATION', hint: 'Trait that helps survival', category: 'Evolutionary Biology' },
    { word: 'SPECIES', hint: 'Group of similar organisms', category: 'Taxonomy' },
    { word: 'HABITAT', hint: 'Natural environment of an organism', category: 'Ecology' },
    { word: 'BIODIVERSITY', hint: 'Variety of life in an area', category: 'Ecology' },
    { word: 'FOOD CHAIN', hint: 'Sequence of who eats whom', category: 'Ecology' },
    { word: 'SYMBIOSIS', hint: 'Close relationship between species', category: 'Ecology' },
    { word: 'PARASITISM', hint: 'Relationship where one benefits, one is harmed', category: 'Ecology' },
    { word: 'MUTUALISM', hint: 'Relationship where both benefit', category: 'Ecology' },
    { word: 'COMMENSALISM', hint: 'Relationship where one benefits, one unaffected', category: 'Ecology' },
    { word: 'PREDATION', hint: 'One organism hunting another', category: 'Ecology' },
    { word: 'HERBIVORE', hint: 'Animal that eats plants', category: 'Ecology' },
    { word: 'CARNIVORE', hint: 'Animal that eats other animals', category: 'Ecology' },
    { word: 'OMNIVORE', hint: 'Animal that eats both plants and animals', category: 'Ecology' },
    { word: 'DECOMPOSER', hint: 'Organism that breaks down dead matter', category: 'Ecology' },
    { word: 'PRODUCER', hint: 'Organism that makes its own food', category: 'Ecology' },
    { word: 'CONSUMER', hint: 'Organism that eats other organisms', category: 'Ecology' },
    { word: 'CELL DIVISION', hint: 'Process by which cells reproduce', category: 'Cell Biology' },
    { word: 'MITOSIS', hint: 'Division of the nucleus', category: 'Cell Biology' },
    { word: 'MEIOSIS', hint: 'Cell division for gametes', category: 'Cell Biology' },
    { word: 'ORGANELLE', hint: 'Specialized structure within a cell', category: 'Cell Biology' },
    { word: 'CYTOPLASM', hint: 'Jelly-like substance in cells', category: 'Cell Biology' },
    { word: 'CELL WALL', hint: 'Rigid outer layer in plant cells', category: 'Cell Biology' },
    { word: 'CHLOROPLAST', hint: 'Organelle for photosynthesis', category: 'Cell Biology' },
    { word: 'VACUOLE', hint: 'Storage sac in cells', category: 'Cell Biology' },
    { word: 'RIBOSOME', hint: 'Site of protein synthesis', category: 'Cell Biology' },
    { word: 'ENDOPLASMIC RETICULUM', hint: 'Network for protein and lipid synthesis', category: 'Cell Biology' },
    { word: 'GOLGI APPARATUS', hint: 'Modifies and packages proteins', category: 'Cell Biology' },
    { word: 'LYSOSOME', hint: 'Contains digestive enzymes', category: 'Cell Biology' },
    { word: 'TISSUE', hint: 'Group of similar cells', category: 'Anatomy' },
    { word: 'ORGAN', hint: 'Structure made of different tissues', category: 'Anatomy' },
    { word: 'ORGAN SYSTEM', hint: 'Group of organs working together', category: 'Anatomy' }
  ];
  
  // Keyboard layout for on-screen keyboard
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];
  
  // Hangman images for each stage
  const hangmanImages = [
    // 0 incorrect guesses - empty gallows
    `
      +---+
      |   |
          |
          |
          |
          |
    =========
    `,
    // 1 incorrect guess - head
    `
      +---+
      |   |
      O   |
          |
          |
          |
    =========
    `,
    // 2 incorrect guesses - head and body
    `
      +---+
      |   |
      O   |
      |   |
          |
          |
    =========
    `,
    // 3 incorrect guesses - head, body, and one arm
    `
      +---+
      |   |
      O   |
     /|   |
          |
          |
    =========
    `,
    // 4 incorrect guesses - head, body, and both arms
    `
      +---+
      |   |
      O   |
     /|\\  |
          |
          |
    =========
    `,
    // 5 incorrect guesses - head, body, both arms, and one leg
    `
      +---+
      |   |
      O   |
     /|\\  |
     /    |
          |
    =========
    `,
    // 6 incorrect guesses - full body (game over)
    `
      +---+
      |   |
      O   |
     /|\\  |
     / \\  |
          |
    =========
    `
  ];
  
  const startGame = () => {
    // Select a random word
    const randomIndex = Math.floor(Math.random() * biologyWords.length);
    const selectedWord = biologyWords[randomIndex];
    
    setWord(selectedWord.word);
    setHint(selectedWord.hint);
    setCategory(selectedWord.category);
    setGuessedLetters([]);
    setIncorrectGuesses(0);
    setShowHint(false);
    setGameState('playing');
  };
  
  const guessLetter = (letter) => {
    if (gameState() !== 'playing' || guessedLetters().includes(letter)) {
      return;
    }
    
    const newGuessedLetters = [...guessedLetters(), letter];
    setGuessedLetters(newGuessedLetters);
    
    // Check if the guess is incorrect
    if (!word().includes(letter)) {
      const newIncorrectGuesses = incorrectGuesses() + 1;
      setIncorrectGuesses(newIncorrectGuesses);
      
      // Show hint after 3 incorrect guesses
      if (newIncorrectGuesses === 3 && !showHint()) {
        setShowHint(true);
      }
      
      // Check if the game is over
      if (newIncorrectGuesses >= maxIncorrectGuesses()) {
        setGameState('gameOver');
      }
    } else {
      // Check if the player has won
      const wordLetters = Array.from(new Set(word().split('')));
      const hasWon = wordLetters.every(l => newGuessedLetters.includes(l));
      
      if (hasWon) {
        setGameState('gameOver');
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (gameState() !== 'playing') return;
    
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      guessLetter(letter);
    }
  };
  
  onMount(() => {
    window.addEventListener('keydown', handleKeyPress);
  });
  
  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyPress);
  });
  
  // Display word with guessed letters revealed
  const displayWord = () => {
    return word()
      .split('')
      .map(letter => (guessedLetters().includes(letter) ? letter : '_'))
      .join(' ');
  };
  
  // Check if a letter has been guessed
  const isLetterGuessed = (letter) => {
    return guessedLetters().includes(letter);
  };
  
  // Check if a letter is in the word
  const isLetterInWord = (letter) => {
    return word().includes(letter);
  };
  
  // Check if the game is won
  const isGameWon = () => {
    if (gameState() !== 'gameOver') return false;
    
    const wordLetters = Array.from(new Set(word().split('')));
    return wordLetters.every(letter => guessedLetters().includes(letter));
  };
  
  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <h1 class="text-3xl font-bold mb-6 text-green-700">Biology Hangman</h1>
      
      {gameState() === 'menu' && (
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4 text-center">Welcome to Biology Hangman!</h2>
          <p class="mb-6 text-center">Test your biology knowledge by guessing the hidden word. You have {maxIncorrectGuesses()} incorrect guesses allowed.</p>
          <div class="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 class="font-bold mb-2">How to Play:</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Guess letters to reveal the hidden biology word</li>
              <li>Each incorrect guess adds a part to the hangman</li>
              <li>A hint will appear after 3 incorrect guesses</li>
              <li>Use the on-screen keyboard or your physical keyboard</li>
              <li>Try to guess the word before the hangman is complete!</li>
            </ul>
          </div>
          <button 
            onClick={startGame}
            class="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold"
          >
            Start Game
          </button>
        </div>
      )}
      
      {(gameState() === 'playing' || gameState() === 'gameOver') && (
        <div class="w-full max-w-4xl">
          <div class="flex flex-col md:flex-row gap-6">
            {/* Left column - Hangman image and game info */}
            <div class="md:w-1/2">
              <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div class="mb-4">
                  <div class="text-center font-mono text-lg whitespace-pre bg-gray-100 p-4 rounded">
                    {hangmanImages[incorrectGuesses()]}
                  </div>
                </div>
                
                <div class="text-center mb-4">
                  <p class="text-lg font-semibold">
                    Incorrect guesses: {incorrectGuesses()} / {maxIncorrectGuesses()}
                  </p>
                  {!showHint() && incorrectGuesses() < 3 && (
                    <p class="text-sm text-gray-500 mt-1">
                      Hint will appear after 3 incorrect guesses
                    </p>
                  )}
                </div>
                
                <div class="bg-blue-50 p-4 rounded-lg mb-4">
                  <p class="font-semibold">Category:</p>
                  <p class="text-lg">{category()}</p>
                </div>
                
                {showHint() && (
                  <div class="bg-yellow-50 p-4 rounded-lg">
                    <p class="font-semibold">Hint:</p>
                    <p>{hint()}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right column - Word display and keyboard */}
            <div class="md:w-1/2">
              <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div class="text-center mb-6">
                  <div class="text-3xl font-mono font-bold letter-spacing-wide">
                    {displayWord()}
                  </div>
                </div>
                
                {/* On-screen keyboard */}
                <div class="mb-6">
                  {keyboardLayout.map((row, rowIndex) => (
                    <div key={rowIndex} class="flex justify-center mb-2">
                      {row.map(letter => (
                        <button
                          key={letter}
                          onClick={() => guessLetter(letter)}
                          disabled={isLetterGuessed(letter) || gameState() === 'gameOver'}
                          class={`w-10 h-10 m-1 rounded-md font-bold transition ${
                            isLetterGuessed(letter)
                              ? isLetterInWord(letter)
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                
                {gameState() === 'gameOver' && (
                  <div class="text-center">
                    <div class={`text-xl font-bold mb-4 ${isGameWon() ? 'text-green-600' : 'text-red-600'}`}>
                      {isGameWon() ? 'Congratulations! You won!' : 'Game Over!'}
                    </div>
                    
                    {!isGameWon() && (
                      <div class="mb-4 p-3 bg-red-50 rounded-lg">
                        <p class="font-semibold">The word was:</p>
                        <p class="text-xl">{word()}</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={startGame}
                      class="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold"
                    >
                      Play Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiologyHangman;