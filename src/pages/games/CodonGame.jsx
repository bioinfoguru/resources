// src/components/CodonGame.jsx
import { createSignal, onMount, onCleanup } from 'solid-js';

const CodonGame = () => {
  const [score, setScore] = createSignal(0);
  const [combo, setCombo] = createSignal(0);
  const [speed, setSpeed] = createSignal(1);
  const [currentAminoAcid, setCurrentAminoAcid] = createSignal(null);
  const [correctCodons, setCorrectCodons] = createSignal([]);
  const [currentCodon, setCurrentCodon] = createSignal('');
  const [gameRunning, setGameRunning] = createSignal(true);
  const [isBursting, setIsBursting] = createSignal(false);
  const [showGameOver, setShowGameOver] = createSignal(false);
  
  let fallingInterval = null;
  let aminoAcidElement = null;
  let gameAreaRef = null;
  let audioContext = null;
  
  // Amino acid to RNA codon mapping
  const aminoAcidCodons = {
    'Phenylalanine': ['UUU', 'UUC'],
    'Leucine': ['UUA', 'UUG', 'CUU', 'CUC', 'CUA', 'CUG'],
    'Serine': ['UCU', 'UCC', 'UCA', 'UCG', 'AGU', 'AGC'],
    'Tyrosine': ['UAU', 'UAC'],
    'Stop': ['UAA', 'UAG', 'UGA'],
    'Cysteine': ['UGU', 'UGC'],
    'Tryptophan': ['UGG'],
    'Proline': ['CCU', 'CCC', 'CCA', 'CCG'],
    'Histidine': ['CAU', 'CAC'],
    'Glutamine': ['CAA', 'CAG'],
    'Arginine': ['CGU', 'CGC', 'CGA', 'CGG', 'AGA', 'AGG'],
    'Isoleucine': ['AUU', 'AUC', 'AUA'],
    'Threonine': ['ACU', 'ACC', 'ACA', 'ACG'],
    'Asparagine': ['AAU', 'AAC'],
    'Lysine': ['AAA', 'AAG'],
    'Valine': ['GUU', 'GUC', 'GUA', 'GUG'],
    'Alanine': ['GCU', 'GCC', 'GCA', 'GCG'],
    'Aspartic acid': ['GAU', 'GAC'],
    'Glutamic acid': ['GAA', 'GAG'],
    'Glycine': ['GGU', 'GGC', 'GGA', 'GGG']
  };
  
  // Initialize audio on first user interaction
  const initAudio = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  };
  
  // Play popping sound
  const playPopSound = () => {
    try {
      const audioContext = initAudio();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create oscillator for pop sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set oscillator type and frequency
      oscillator.type = 'sine';
      oscillator.frequency.value = 300;
      
      // Create a quick pop effect
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      // Start and stop the oscillator
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log('Audio playback failed:', e);
    }
  };
  
  // Function to adjust game area size
  const adjustGameAreaSize = () => {
    if (!gameAreaRef) return;
    
    const header = document.querySelector('header');
    const keypad = document.querySelector('.keypad');
    const footer = document.querySelector('footer');
    
    // Ensure elements exist before getting their heights
    const headerHeight = header ? header.offsetHeight : 0;
    const keypadHeight = keypad ? keypad.offsetHeight : 0;
    const footerHeight = footer ? footer.offsetHeight : 0;
    const padding = 20;
    
    const availableHeight = window.innerHeight - headerHeight - keypadHeight - footerHeight - padding;
    const minHeight = Math.max(availableHeight * 0.6, 200); // Ensure minimum usable height
    
    gameAreaRef.style.minHeight = `${minHeight}px`;
    
    // Adjust amino acid position if it exists
    if (aminoAcidElement && aminoAcidElement.style.top) {
      const currentTop = parseInt(aminoAcidElement.style.top);
      if (currentTop > minHeight - 50) {
        aminoAcidElement.style.top = `${minHeight - 50}px`;
      }
    }
  };
  
  // Function to adjust speed based on game area height
  const adjustSpeedBasedOnGameArea = () => {
    if (!gameAreaRef) return;
    
    const gameAreaHeight = gameAreaRef.offsetHeight;
    const windowHeight = window.innerHeight;
    
    // Calculate speed multiplier based on game area height relative to window height
    const heightRatio = gameAreaHeight / windowHeight;
    
    // Base speed adjusted by height ratio
    // Smaller game areas should have proportionally slower falling speed
    const adjustedSpeed = Math.max(0.5, speed() * heightRatio);
    
    return adjustedSpeed;
  };
  
  // Function to start falling with specific speed
  const startFallingWithSpeed = (gameSpeed) => {
    let position = 0;
    fallingInterval = setInterval(() => {
      if (!gameRunning() || !aminoAcidElement || isBursting()) return;
      
      position += 2 * gameSpeed;
      aminoAcidElement.style.top = position + 'px';
      
      if (position > gameAreaRef.offsetHeight - 50) {
        gameOver();
      }
    }, 50);
  };
  
  // Initialize game
  const startGame = () => {
    // Clear codon at start
    setCurrentCodon('');
    updateInputDisplay();
    
    // Adjust game area size
    adjustGameAreaSize();
    
    spawnNewAminoAcid();
  };
  
  // Spawn new amino acid
  const spawnNewAminoAcid = () => {
    // Clear any existing falling interval
    if (fallingInterval) {
      clearInterval(fallingInterval);
      fallingInterval = null;
    }
    
    // Reset burst flag to ensure new amino acid can burst
    setIsBursting(false);
    
    // Get all amino acids
    const aminoAcids = Object.keys(aminoAcidCodons);
    
    // Filter out stop codons for gameplay
    const nonStopAminoAcids = aminoAcids.filter(aa => aa !== 'Stop');
    const newAminoAcid = nonStopAminoAcids[Math.floor(Math.random() * nonStopAminoAcids.length)];
    setCurrentAminoAcid(newAminoAcid);
    
    // Get all codons for this amino acid
    const newCorrectCodons = aminoAcidCodons[newAminoAcid];
    setCorrectCodons(newCorrectCodons);
    
    if (aminoAcidElement) {
      aminoAcidElement.remove();
    }
    
    aminoAcidElement = document.createElement('div');
    aminoAcidElement.className = 'amino-acid absolute px-4 py-2.5 bg-gradient-to-r from-fuchsia-400 to-rose-500 rounded-full text-xl font-bold shadow-lg transition-transform duration-100 cursor-pointer whitespace-nowrap';
    aminoAcidElement.textContent = newAminoAcid;
    
    // Position the amino acid within the game area
    const maxLeft = Math.max(gameAreaRef.offsetWidth - 120, 0);
    aminoAcidElement.style.left = Math.random() * maxLeft + 'px';
    aminoAcidElement.style.top = '0px';
    
    gameAreaRef.appendChild(aminoAcidElement);
    
    // Start falling with adjusted speed
    const adjustedSpeed = adjustSpeedBasedOnGameArea();
    startFallingWithSpeed(adjustedSpeed);
  };
  
  // Handle key press
  const handleKeyPress = (key) => {
    if (currentCodon().length < 3 && !isBursting()) {
      const newCodon = currentCodon() + key;
      setCurrentCodon(newCodon);
      updateInputDisplay();
      
      // Auto-submit when third base is entered
      if (newCodon.length === 3) {
        setTimeout(checkAnswer, 100);
      }
    }
  };
  
  // Clear button
  const handleClear = () => {
    if (!isBursting()) {
      setCurrentCodon('');
      updateInputDisplay();
    }
  };
  
  // Keyboard support
  const handleKeyDown = (e) => {
    if (!gameRunning() || isBursting()) return;
    
    if (['A', 'C', 'G', 'U'].includes(e.key.toUpperCase())) {
      handleKeyPress(e.key.toUpperCase());
    } else if (e.key === 'Backspace') {
      setCurrentCodon('');
      updateInputDisplay();
    } else if (e.key === 'Escape') {
      setCurrentCodon('');
      updateInputDisplay();
    }
  };
  
  // Update input display
  const updateInputDisplay = () => {
    let display = currentCodon();
    while (display.length < 3) {
      display += '-';
    }
    const inputDisplay = document.getElementById('inputDisplay');
    if (inputDisplay) {
      inputDisplay.textContent = display;
    }
  };
  
  // Check answer
  const checkAnswer = () => {
    if (currentCodon().length !== 3 || isBursting()) return;
    
    // Check if the entered codon is in the list of valid codons for the current amino acid
    if (correctCodons().includes(currentCodon())) {
      // Correct answer
      const newCombo = combo() + 1;
      setCombo(newCombo);
      const newScore = score() + 10 * newCombo;
      setScore(newScore);
      setIsBursting(true);
      updateScore();
      
      // Increase speed every 5 correct answers
      if (newCombo % 5 === 0) {
        const newSpeed = speed() + 0.2;
        setSpeed(newSpeed);
        const speedElement = document.getElementById('speed');
        if (speedElement) {
          speedElement.textContent = newSpeed.toFixed(1) + 'x';
        }
      }
      
      // Clear the falling interval
      clearInterval(fallingInterval);
      fallingInterval = null;
      
      // Create burst effect
      createBurstEffect();
      
      // Spawn new amino acid after burst animation completes
      setTimeout(() => {
        spawnNewAminoAcid();
        setCurrentCodon('');
        updateInputDisplay();
      }, 600);
    } else {
      // Wrong answer - clear the codon
      setCombo(0);
      updateScore();
      const inputDisplay = document.getElementById('inputDisplay');
      if (inputDisplay) {
        inputDisplay.classList.add('animate-shake');
        setTimeout(() => {
          inputDisplay.classList.remove('animate-shake');
          setCurrentCodon('');
          updateInputDisplay();
        }, 500);
      }
    }
  };
  
  // Create burst effect with sound
  const createBurstEffect = () => {
    if (!aminoAcidElement) return;
    
    aminoAcidElement.classList.add('animate-burst');
    
    // Play popping sound
    playPopSound();
    
    // Create particles
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none';
      particle.style.left = aminoAcidElement.offsetLeft + 50 + 'px';
      particle.style.top = aminoAcidElement.offsetTop + 25 + 'px';
      particle.style.setProperty('--x', (Math.random() - 0.5) * 200 + 'px');
      particle.style.setProperty('--y', (Math.random() - 0.5) * 200 + 'px');
      particle.style.animation = 'particle 0.5s ease-out forwards';
      gameAreaRef.appendChild(particle);
      
      setTimeout(() => particle.remove(), 500);
    }
  };
  
  // Update score display
  const updateScore = () => {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = score();
    }
  };
  
  // Game over - clear the codon
  const gameOver = () => {
    setGameRunning(false);
    clearInterval(fallingInterval);
    fallingInterval = null;
    setCurrentCodon('');
    updateInputDisplay();
    const finalScoreElement = document.getElementById('finalScore');
    if (finalScoreElement) {
      finalScoreElement.textContent = score();
    }
    setShowGameOver(true);
  };
  
  // Restart game - clear the codon
  const restartGame = () => {
    setScore(0);
    setCombo(0);
    setSpeed(1);
    setCurrentCodon('');
    setGameRunning(true);
    setIsBursting(false);
    updateScore();
    const speedElement = document.getElementById('speed');
    if (speedElement) {
      speedElement.textContent = '1.0x';
    }
    setShowGameOver(false);
    updateInputDisplay();
    
    // Clear any existing falling interval
    if (fallingInterval) {
      clearInterval(fallingInterval);
      fallingInterval = null;
    }
    
    // Clear any existing amino acid
    if (aminoAcidElement) {
      aminoAcidElement.remove();
      aminoAcidElement = null;
    }
    
    // Adjust game area size before restarting
    adjustGameAreaSize();
    
    // Spawn new amino acid and start falling
    spawnNewAminoAcid();
  };
  
  onMount(() => {
    // Initialize the game when the component mounts
    startGame();
    
    // Add resize event listener to adjust game area size
    window.addEventListener('resize', adjustGameAreaSize);
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Initialize audio on first user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    
    // Add shake animation to the document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
      
      @keyframes burst {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.5);
          opacity: 0.5;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      
      @keyframes particle {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--x), var(--y)) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  });
  
  onCleanup(() => {
    // Clean up event listeners
    window.removeEventListener('resize', adjustGameAreaSize);
    window.removeEventListener('keydown', handleKeyDown);
    
    // Clear any intervals
    if (fallingInterval) {
      clearInterval(fallingInterval);
    }
  });
  
  return (
    <div class="flex flex-col min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-x-hidden">
      <header class="py-2.5 text-center w-full bg-black/20 backdrop-blur-md flex-shrink-0 relative">
        <div class="logo-container absolute left-2.5 top-1/2 transform -translate-y-1/2 w-12 h-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 476 712" class="w-full h-full">
            <path id="bg_logo" fill="#9c51e0" stroke="none" strokeWidth="0" d="M 0.00,0.00 C 0.00,0.00 130.00,0.00 130.00,0.00 130.00,0.00 168.00,0.00 168.00,0.00 168.00,0.00 186.00,1.00 186.00,1.00 186.00,1.00 152.00,17.75 152.00,17.75 152.00,17.75 92.00,47.75 92.00,47.75 92.00,47.75 72.00,57.75 72.00,57.75 72.00,57.75 64.02,63.21 64.02,63.21 64.02,63.21 63.00,71.00 63.00,71.00 63.00,71.00 63.00,649.00 63.00,649.00 63.00,649.00 413.00,649.00 413.00,649.00 413.00,649.00 413.00,359.00 413.00,359.00 413.00,359.00 298.00,397.33 298.00,397.33 298.00,397.33 262.00,409.33 262.00,409.33 262.00,409.33 240.00,416.00 240.00,416.00 240.00,416.00 240.00,471.00 240.00,471.00 240.00,471.00 313.00,452.63 313.00,452.63 313.00,452.63 358.00,442.00 358.00,442.00 358.00,442.00 358.00,594.00 358.00,594.00 358.00,594.00 118.00,594.00 118.00,594.00 118.00,594.00 118.00,294.00 118.00,294.00 118.00,294.00 320.00,334.40 320.00,334.40 320.00,334.40 382.00,346.80 382.00,346.80 382.00,346.80 417.00,353.00 417.00,353.00 417.00,353.00 431.59,441.00 431.59,441.00 431.59,441.00 458.41,602.00 458.41,602.00 458.41,602.00 470.25,673.00 470.25,673.00 470.25,673.00 476.00,712.00 476.00,712.00 476.00,712.00 0.00,712.00 0.00,712.00 0.00,712.00 0.00,0.00 Z" />
          </svg>
        </div>
        <h1 class="text-1.8em mb-1 text-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center gap-1.5 flex-wrap pl-12">
          <span class="text-0.8em mr-1">The</span>
          <span class="bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[8px] px-1 py-0 -mr-1 text-0.8em font-bold text-[#333] shadow-[0_2px_5px_rgba(0,0,0,0.2)] cursor-default">C</span>
          <span class="text-0.8em mr-1">odon</span>
          <span class="bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[8px] px-1 py-0 -mr-1 text-0.8em font-bold text-[#333] shadow-[0_2px_5px_rgba(0,0,0,0.2)] cursor-default">G</span>
          <span class="text-0.8em mr-1">ame</span>
          <span class="bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[8px] px-1 py-0 -mr-1 text-0.8em font-bold text-[#333] shadow-[0_2px_5px_rgba(0,0,0,0.2)] cursor-default">A</span>
          <span class="text-0.8em">pp</span>
        </h1>
        <div class="score-board flex gap-4 text-0.9em float-right mt-1">
          <div class="score-item flex items-center gap-1">
            <span>Score:</span>
            <span class="score-value font-bold text-1.1em text-yellow-400" id="score">0</span>
          </div>
          <div class="score-item flex items-center gap-1">
            <span>Speed:</span>
            <span class="score-value font-bold text-1.1em text-yellow-400" id="speed">1.0x</span>
          </div>
        </div>
      </header>
      
      <main class="flex-1 flex flex-col w-full max-w-4xl mx-auto p-1 overflow-hidden min-h-0">
        <section class="game-area flex-1 relative bg-white/10 rounded-[15px] backdrop-blur-sm overflow-hidden border border-white/20 mb-2.5 w-full" ref={el => gameAreaRef = el}>
          <div class="hint absolute top-1 right-1 bg-black/70 px-2.5 py-1 rounded-[15px] text-0.9em max-w-[70%] text-right" id="hint">Type the codon!</div>
          <div class="input-display absolute bottom-2.5 left-1/2 transform -translate-x-1/2 bg-black/70 px-5 py-2.5 rounded-[20px] text-1.5em font-bold tracking-[0.5em] min-w-[150px] text-center" id="inputDisplay">---</div>
        </section>
        
        <section class="keypad grid grid-cols-4 grid-rows-2 gap-2 p-2 w-full max-w-[300px] mx-auto">
          <button class="key bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[10px] text-1.5em font-bold text-[#333] cursor-pointer transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.2)] aspect-square flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" data-key="A" onClick={() => handleKeyPress('A')}>A</button>
          <button class="key bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[10px] text-1.5em font-bold text-[#333] cursor-pointer transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.2)] aspect-square flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" data-key="C" onClick={() => handleKeyPress('C')}>C</button>
          <button class="key bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[10px] text-1.5em font-bold text-[#333] cursor-pointer transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.2)] aspect-square flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" data-key="G" onClick={() => handleKeyPress('G')}>G</button>
          <button class="key bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[10px] text-1.5em font-bold text-[#333] cursor-pointer transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.2)] aspect-square flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" data-key="U" onClick={() => handleKeyPress('U')}>U</button>
          <button class="clear-btn col-span-2 aspect-[2/1] text-1em bg-gradient-to-r from-pink-400 to-yellow-300 border-none rounded-[10px] font-bold text-[#333] cursor-pointer transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.2)] flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" id="clearBtn" onClick={handleClear}>Clear</button>
        </section>
      </main>
      
      <footer class="py-2 text-center w-full backdrop-blur-md flex-shrink-0 h-auto min-h-[40px] order-3 box-border">
        <div class="social-icons flex justify-center gap-4 mt-1">
          <a href="https://fb.bioinfo.guru" class="social-icon no-underline">
            <span class="inline-flex items-center justify-center w-6 h-6 bg-black/20 rounded-full text-[#9c51e0] text-0.9em transition-all duration-300 hover:bg-white/30 hover:text-1.1em hover:translate-y-[-3px]">
              <i class="fab fa-facebook-f"></i>
            </span>
          </a>
          <a href="https://tw.bioinfo.guru" class="social-icon no-underline">
            <span class="inline-flex items-center justify-center w-6 h-6 bg-black/20 rounded-full text-[#9c51e0] text-0.9em transition-all duration-300 hover:bg-white/30 hover:text-1.1em hover:translate-y-[-3px]">
              <i class="fa-brands fa-x-twitter"></i>
            </span>
          </a>
          <a href="https://ig.bioinfo.guru" class="social-icon no-underline">
            <span class="inline-flex items-center justify-center w-6 h-6 bg-black/20 rounded-full text-[#9c51e0] text-0.9em transition-all duration-300 hover:bg-white/30 hover:text-1.1em hover:translate-y-[-3px]">
              <i class="fab fa-instagram"></i>
            </span>
          </a>
          <a href="https://wa.bioinfo.guru" class="social-icon no-underline">
            <span class="inline-flex items-center justify-center w-6 h-6 bg-black/20 rounded-full text-[#9c51e0] text-0.9em transition-all duration-300 hover:bg-white/30 hover:text-1.1em hover:translate-y-[-3px]">
              <i class="fab fa-whatsapp"></i>
            </span>
          </a>
          <a href="https://li.bioinfo.guru" class="social-icon no-underline">
            <span class="inline-flex items-center justify-center w-6 h-6 bg-black/20 rounded-full text-[#9c51e0] text-0.9em transition-all duration-300 hover:bg-white/30 hover:text-1.1em hover:translate-y-[-3px]">
              <i class="fab fa-linkedin-in"></i>
            </span>
          </a>
          <a href="bsky.app/profile/bioinfoguru.bsky.social" class="social-icon no-underline">
            <span class="inline-flex items-center justify-center w-6 h-6 bg-black/20 rounded-full text-[#9c51e0] text-0.9em transition-all duration-300 hover:bg-white/30 hover:text-1.1em hover:translate-y-[-3px]">
              <i class="fa-brands fa-bluesky"></i>
            </span>
          </a>
        </div>
      </footer>
      
      {showGameOver() && (
        <div class="game-over fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 p-8 rounded-[15px] text-center z-[1000] w-[90%] max-w-[350px]">
          <h2 class="text-2xl mb-4 text-red-400">Game Over!</h2>
          <p class="text-1.3em mb-5">Final Score: <span id="finalScore">{score()}</span></p>
          <button class="restart-btn bg-gradient-to-r from-indigo-500 to-purple-600 border-none px-8 py-3 text-1.1em text-white rounded-[25px] cursor-pointer transition-transform duration-200 hover:scale-105" onClick={restartGame}>
            Play Again
          </button>
        </div>
      )}
      
      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .key {
            font-size: 1.3em;
            min-height: 35px;
          }
          .clear-btn {
            font-size: 0.9em;
          }
          .score-board {
            font-size: 0.8em;
            gap: 2.5px;
          }
          h1 {
            font-size: 1.6em;
          }
          .logo-container {
            width: 45px;
            height: 45px;
          }
          footer {
            padding: 6px;
            min-height: 35px;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 1.5em;
            gap: 3px;
          }
          .title-button {
            margin-right: -3px;
          }
          .score-board {
            font-size: 0.8em;
            gap: 2.5px;
          }
          .game-area {
            min-height: 40vh;
          }
          .amino-acid {
            font-size: 1em;
            padding: 8px 12px;
          }
          .input-display {
            font-size: 1.3em;
            letter-spacing: 0.375em;
            padding: 8px 15px;
            min-width: 120px;
          }
          .key {
            font-size: 1.2em;
            min-height: 30px;
          }
          .clear-btn {
            font-size: 0.8em;
          }
          .hint {
            font-size: 0.8em;
            padding: 4px 8px;
          }
          .game-over {
            padding: 25px;
          }
          .game-over h2 {
            font-size: 1.8em;
          }
          .game-over p {
            font-size: 1.2em;
          }
          .social-icon {
            width: 22px;
            height: 22px;
            font-size: 0.8em;
          }
          .logo-container {
            width: 40px;
            height: 40px;
          }
        }
        
        @media (max-height: 600px) {
          header {
            padding: 8px;
          }
          h1 {
            font-size: 1.6em;
            margin-bottom: 3px;
          }
          .score-board {
            font-size: 0.8em;
            gap: 2.5px;
          }
          .game-area {
            min-height: 40vh;
          }
          .input-display {
            font-size: 1.3em;
            letter-spacing: 0.375em;
            padding: 6px 12px;
            bottom: 8px;
          }
          .keypad {
            gap: 6px;
            padding: 6px;
          }
          .key {
            font-size: 1.2em;
            min-height: 30px;
          }
          .clear-btn {
            font-size: 0.9em;
          }
          .hint {
            font-size: 0.8em;
            padding: 4px 8px;
          }
          footer {
            padding: 6px;
            min-height: 35px;
          }
          .social-icon {
            width: 22px;
            height: 22px;
            font-size: 0.8em;
          }
          .logo-container {
            width: 40px;
            height: 40px;
          }
        }
        
        @media (max-height: 500px) {
          h1 {
            font-size: 1.4em;
          }
          .title-button {
            margin-right: -2px;
          }
          .game-area {
            min-height: 35vh;
          }
          .keypad {
            gap: 5px;
            padding: 5px;
          }
          .key {
            font-size: 1.1em;
            min-height: 25px;
          }
          .clear-btn {
            font-size: 0.8em;
          }
          .input-display {
            font-size: 1.2em;
            padding: 5px 10px;
            letter-spacing: 0.3125em;
          }
          .amino-acid {
            font-size: 0.9em;
            padding: 6px 10px;
          }
          .hint {
            font-size: 0.7em;
            padding: 3px 6px;
          }
          .logo-container {
            width: 35px;
            height: 35px;
          }
        }
        
        @media (max-height: 400px) {
          h1 {
            font-size: 1.2em;
          }
          .title-button {
            margin-right: -1px;
          }
          .game-area {
            min-height: 30vh;
          }
          .keypad {
            gap: 4px;
            padding: 4px;
          }
          .key {
            font-size: 1em;
            min-height: 20px;
          }
          .clear-btn {
            font-size: 0.7em;
          }
          .input-display {
            font-size: 1.1em;
            padding: 4px 8px;
            letter-spacing: 0.25em;
          }
          .amino-acid {
            font-size: 0.8em;
            padding: 5px 8px;
          }
          .hint {
            font-size: 0.6em;
            padding: 2px 5px;
          }
          .score-board {
            font-size: 0.7em;
            gap: 2px;
          }
          .score-value {
            font-size: 1em;
          }
          .logo-container {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default CodonGame;