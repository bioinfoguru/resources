// src/components/ImmuneSystemDefense.jsx
import { createSignal, onMount, onCleanup, createEffect } from 'solid-js';
import { render } from 'solid-js/web';

const ImmuneSystemDefense = () => {
  // Game state
  const [gameState, setGameState] = createSignal('menu'); // menu, playing, paused, gameOver
  const [level, setLevel] = createSignal(1);
  const [health, setHealth] = createSignal(100);
  const [resources, setResources] = createSignal(50);
  const [score, setScore] = createSignal(0);
  const [selectedCell, setSelectedCell] = createSignal('macrophage'); // Set default selection
  const [gameSpeed, setGameSpeed] = createSignal(1);
  const [showHelp, setShowHelp] = createSignal(false);
  const [notifications, setNotifications] = createSignal([]);
  const [specialAbilities, setSpecialAbilities] = createSignal({
    freeze: { cooldown: 0, maxCooldown: 30000, duration: 5000, active: false },
    boost: { cooldown: 0, maxCooldown: 45000, duration: 8000, active: false },
    bomb: { cooldown: 0, maxCooldown: 60000, active: false }
  });
  const [waveActive, setWaveActive] = createSignal(false);
  const [waveProgress, setWaveProgress] = createSignal(0);
  const [pathogensInWave, setPathogensInWave] = createSignal(0);
  const [pathogensDefeated, setPathogensDefeated] = createSignal(0);
  
  // Game entities
  const [pathogens, setPathogens] = createSignal([]);
  const [immuneCells, setImmuneCells] = createSignal([]);
  const [projectiles, setProjectiles] = createSignal([]);
  const [effects, setEffects] = createSignal([]);
  
  // Game constants
  const CELL_TYPES = [
    { 
      id: 'macrophage', 
      name: 'Macrophage', 
      letter: 'M', 
      cost: 10, 
      damage: 5, 
      range: 100, 
      fireRate: 1000, 
      color: 'bg-blue-500',
      description: 'Basic cell with balanced stats. Effective against all pathogens.',
      strengths: ['bacteria'],
      weaknesses: []
    },
    { 
      id: 'neutrophil', 
      name: 'Neutrophil', 
      letter: 'N', 
      cost: 15, 
      damage: 8, 
      range: 80, 
      fireRate: 800, 
      color: 'bg-purple-500',
      description: 'Fast-attacking cell with shorter range. Excellent against bacteria.',
      strengths: ['bacteria', 'fungus'],
      weaknesses: ['parasite']
    },
    { 
      id: 'tcell', 
      name: 'T-Cell', 
      letter: 'T', 
      cost: 25, 
      damage: 15, 
      range: 150, 
      fireRate: 1500, 
      color: 'bg-green-500',
      description: 'Specialized cell with long range. Only effective against viruses and superbugs.',
      strengths: ['virus', 'superbug'],
      weaknesses: ['bacteria', 'fungus', 'parasite']
    },
    { 
      id: 'bcell', 
      name: 'B-Cell', 
      letter: 'B', 
      cost: 30, 
      damage: 20, 
      range: 120, 
      fireRate: 2000, 
      color: 'bg-yellow-500',
      description: 'Powerful cell that produces antibodies. Strong against parasites and fungi.',
      strengths: ['parasite', 'fungus'],
      weaknesses: ['virus']
    }
  ];
  
  const PATHOGEN_TYPES = [
    { id: 'bacteria', name: 'Bacteria', letter: 'B', health: 20, speed: 1, damage: 5, reward: 5, color: 'bg-red-500' },
    { id: 'virus', name: 'Virus', letter: 'V', health: 10, speed: 2, damage: 3, reward: 8, color: 'bg-red-300' },
    { id: 'fungus', name: 'Fungus', letter: 'F', health: 40, speed: 0.5, damage: 10, reward: 10, color: 'bg-red-700' },
    { id: 'parasite', name: 'Parasite', letter: 'P', health: 60, speed: 0.7, damage: 15, reward: 15, color: 'bg-red-900' },
    { id: 'superbug', name: 'Superbug', letter: 'S', health: 100, speed: 1.5, damage: 20, reward: 30, color: 'bg-gradient-to-r from-red-500 to-purple-600', special: 'resistant' }
  ];
  
  // Game loop
  let gameInterval;
  let spawnInterval;
  let waveInterval;
  let effectInterval;
  let notificationTimeout;
  
  // Auto-increase speed based on number of immune cells
  createEffect(() => {
    const cellCount = immuneCells().length;
    if (cellCount > 5) {
      const speedMultiplier = Math.min(3, 1 + Math.floor((cellCount - 5) / 5));
      setGameSpeed(speedMultiplier);
      
      // Add notification for speed increase
      if (cellCount === 6 || cellCount === 11 || cellCount === 16) {
        addNotification(`Game speed increased to ${speedMultiplier}x!`, 'info');
      }
    } else {
      setGameSpeed(1);
    }
  });
  
  // Add notification function with auto-remove
  const addNotification = (message, type = 'info') => {
    // Clear any existing timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    
    setNotifications([{ id: Date.now(), message, type, timestamp: Date.now() }]);
    
    // Auto-remove notification after 3 seconds
    notificationTimeout = setTimeout(() => {
      setNotifications([]);
    }, 3000);
  };
  
  // Add visual effect function
  const addEffect = (x, y, type, duration = 1000) => {
    const effectId = Date.now() + Math.random();
    setEffects(prev => [...prev, { id: effectId, x, y, type, duration }]);
    
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== effectId));
    }, duration);
  };
  
  const startGame = () => {
    setGameState('playing');
    setHealth(100);
    setResources(50);
    setScore(0);
    setPathogens([]);
    setImmuneCells([]);
    setProjectiles([]);
    setEffects([]);
    setGameSpeed(1);
    setLevel(1);
    setWaveActive(false);
    setWaveProgress(0);
    setPathogensInWave(0);
    setPathogensDefeated(0);
    setSpecialAbilities({
      freeze: { cooldown: 0, maxCooldown: 30000, duration: 5000, active: false },
      boost: { cooldown: 0, maxCooldown: 45000, duration: 8000, active: false },
      bomb: { cooldown: 0, maxCooldown: 60000, active: false }
    });
    
    // Clear any existing intervals
    if (gameInterval) clearInterval(gameInterval);
    if (spawnInterval) clearInterval(spawnInterval);
    if (waveInterval) clearInterval(waveInterval);
    if (effectInterval) clearInterval(effectInterval);
    
    // Set up game loop
    gameInterval = setInterval(updateGame, 1000 / 30); // 30 FPS
    
    // Set up normal pathogen spawning
    spawnInterval = setInterval(spawnPathogen, 3000);
    
    // Set up wave interval (every 45 seconds)
    waveInterval = setInterval(startWave, 45000);
    
    // Set up effect interval
    effectInterval = setInterval(updateEffects, 100);
    
    addNotification("Game started! Defend your body!", 'success');
    
    // Start first wave after 15 seconds
    setTimeout(() => startWave(), 15000);
  };
  
  const startWave = () => {
    if (gameState() !== 'playing') return;
    
    setWaveActive(true);
    setWaveProgress(0);
    setPathogensInWave(0);
    setPathogensDefeated(0);
    
    // Calculate number of pathogens in on level
    const basePathogens = 10 + level() * 2;
    const wavePathogens = basePathogens * 2; // Double the pathogens
    
    setPathogensInWave(wavePathogens);
    
    addNotification(`Wave incoming! ${wavePathogens} pathogens approaching at double speed!`, 'warning');
    
    // Temporarily increase spawn rate
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnPathogen, 1000); // Faster spawning during wave
    
    // Set wave duration (30 seconds)
    setTimeout(() => endWave(), 30000);
  };
  
  const endWave = () => {
    if (!waveActive()) return;
    
    setWaveActive(false);
    
    // Return to normal spawn rate
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnPathogen, 3000);
    
    // Give bonus resources for surviving wave
    const bonusResources = 20 * level();
    setResources(r => r + bonusResources);
    
    addNotification(`Wave completed! +${bonusResources} resources!`, 'success');
    
    // Check if ready for level up
    if (score() >= level() * 100) {
      levelUp();
    }
  };
  
  const levelUp = () => {
    setLevel(l => l + 1);
    setResources(r => r + 30);
    
    addNotification(`Level ${level()} reached!`, 'success');
    
    // Unlock new pathogen types at higher levels
    if (level() === 3) {
      addNotification("New threat detected: Superbugs! Only T-Cells can effectively damage them!", 'warning');
    }
    
    // Start next wave sooner after    setTimeout(() => startWave(), 10000);
  };
  
  const updateGame = () => {
    if (gameState() !== 'playing') return;
    
    // Update special ability cooldowns
    setSpecialAbilities(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[key].cooldown > 0) {
          updated[key] = { ...updated[key], cooldown: Math.max(0, updated[key].cooldown - 33) };
        }
      });
      return updated;
    });
    
    // Move pathogens (without fixed tracks)
    setPathogens(prev => {
      return prev.map(pathogen => {
        const newPathogen = { ...pathogen };
        
        // Calculate direction to the center (body core)
        const centerX = 400;
        const centerY = 200;
        const dx = centerX - pathogen.x;
        const dy = centerY - pathogen.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Random movement for advanced levels
        let randomFactor = 0;
        if (level() > 2 && immuneCells().length > 5) {
          randomFactor = (Math.random() - 0.5) * 4;
        }
        
        // Check if pathogen reached the center
        if (distance < 20) {
          // Pathogen reached the center
          setHealth(h => Math.max(0, h - pathogen.damage));
          addEffect(pathogen.x, pathogen.y, 'damage');
          return null; // Remove this pathogen
        } else {
          // Apply freeze effect if active
          const speedMultiplier = specialAbilities().freeze.active ? 0.2 : 1;
          
          // Double speed during waves
          const waveSpeedMultiplier = waveActive() ? 2 : 1;
          
          // Move toward center with some randomness
          newPathogen.x += ((dx / distance) * pathogen.speed * speedMultiplier * waveSpeedMultiplier) + randomFactor;
          newPathogen.y += ((dy / distance) * pathogen.speed * speedMultiplier * waveSpeedMultiplier) + randomFactor;
        }
        
        return newPathogen;
      }).filter(Boolean); // Remove null entries
    });
    
    // Check for game over
    if (health() <= 0) {
      setGameState('gameOver');
      clearInterval(gameInterval);
      clearInterval(spawnInterval);
      clearInterval(waveInterval);
      clearInterval(effectInterval);
      addNotification("Game Over! Your body has been overwhelmed!", 'error');
    }
    
    // Check level completion
    if (score() >= level() * 100) {
      levelUp();
    }
    
    // Update wave progress
    if (waveActive()) {
      const progress = Math.min(100, (pathogensDefeated() / pathogensInWave()) * 100);
      setWaveProgress(progress);
      
      // Check if wave completed early
      if (pathogensDefeated() >= pathogensInWave() && pathogens().length === 0) {
        endWave();
      }
    }
    
    // Immune cells attack
    immuneCells().forEach(cell => {
      if (Date.now() - cell.lastFire > cell.fireRate / gameSpeed()) {
        // Find nearest pathogen in range
        const target = pathogens().find(p => {
          const dx = p.x - cell.x;
          const dy = p.y - cell.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= cell.range;
        });
        
        if (target) {
          // Create projectile
          setProjectiles(prev => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              x: cell.x,
              y: cell.y,
              targetX: target.x,
              targetY: target.y,
              damage: cell.damage * (specialAbilities().boost.active ? 1.5 : 1),
              speed: 5 * gameSpeed(),
              type: cell.type
            }
          ]);
          
          // Update last fire time
          setImmuneCells(prev => 
            prev.map(c => 
              c.id === cell.id ? { ...c, lastFire: Date.now() } : c
            )
          );
        }
      }
    });
    
    // Move projectiles
    setProjectiles(prev => {
      return prev.map(projectile => {
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < projectile.speed) {
          // Projectile hit target
          setPathogens(p => 
            p.map(pathogen => {
              const pathDx = pathogen.x - projectile.x;
              const pathDy = pathogen.y - projectile.y;
              const pathDistance = Math.sqrt(pathDx * pathDx + pathDy * pathDy);
              
              if (pathDistance < 20) { // Hit radius
                // Get cell and pathogen types for effectiveness calculation
                const cellType = CELL_TYPES.find(c => c.id === projectile.type);
                const pathogenType = PATHOGEN_TYPES.find(pt => pt.id === pathogen.type);
                
                // Calculate damage based on effectiveness
                let damageMultiplier = 1;
                
                // Check for resistance
                if (pathogenType.special === 'resistant' && projectile.type !== 'tcell') {
                  damageMultiplier = 0.2; // Very ineffective
                } 
                // Check for strengths and weaknesses
                else if (cellType.strengths.includes(pathogen.type)) {
                  damageMultiplier = 1.5; // Very effective
                } else if (cellType.weaknesses.includes(pathogen.type)) {
                  damageMultiplier = 0.5; // Not very effective
                }
                
                const newHealth = pathogen.health - (projectile.damage * damageMultiplier);
                
                // Show effectiveness indicator
                if (damageMultiplier > 1) {
                  addEffect(pathogen.x, pathogen.y, 'effective', 500);
                } else if (damageMultiplier < 1) {
                  addEffect(pathogen.x, pathogen.y, 'ineffective', 500);
                }
                
                if (newHealth <= 0) {
                  // Pathogen defeated
                  setResources(r => r + pathogen.reward);
                  setScore(s => s + pathogen.reward);
                  
                  if (waveActive()) {
                    setPathogensDefeated(prev => prev + 1);
                  }
                  
                  addEffect(pathogen.x, pathogen.y, 'defeat');
                  return null; // Remove this pathogen
                }
                return { ...pathogen, health: newHealth };
              }
              return pathogen;
            }).filter(Boolean) // Remove null entries
          );
          
          return null; // Remove this projectile
        }
        
        return {
          ...projectile,
          x: projectile.x + (dx / distance) * projectile.speed,
          y: projectile.y + (dy / distance) * projectile.speed
        };
      }).filter(Boolean); // Remove null entries
    });
  };
  
  const updateEffects = () => {
    // Update active special abilities
    setSpecialAbilities(prev => {
      const updated = { ...prev };
      
      // Check freeze ability
      if (updated.freeze.active && Date.now() - updated.freeze.startTime > updated.freeze.duration) {
        updated.freeze = { ...updated.freeze, active: false };
        addNotification("Freeze effect ended", 'info');
      }
      
      // Check boost ability
      if (updated.boost.active && Date.now() - updated.boost.startTime > updated.boost.duration) {
        updated.boost = { ...updated.boost, active: false };
        addNotification("Boost effect ended", 'info');
      }
      
      return updated;
    });
  };
  
  const spawnPathogen = (type = null) => {
    if (gameState() !== 'playing') return;
    
    // Determine pathogen type
    let pathogenType;
    if (type) {
      pathogenType = PATHOGEN_TYPES.find(p => p.id === type);
    } else {
      // Random selection based on level
      let availablePathogens = PATHOGEN_TYPES.filter(p => p.id !== 'superbug');
      if (level() >= 3) {
        availablePathogens = PATHOGEN_TYPES;
      }
      
      pathogenType = availablePathogens[Math.floor(Math.random() * Math.min(availablePathogens.length, level()))];
    }
    
    // Random entry position at the edges of the game area
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    switch (side) {
      case 0: // top
        x = Math.random() * 800;
        y = 0;
        break;
      case 1: // right
        x = 800;
        y = Math.random() * 400;
        break;
      case 2: // bottom
        x = Math.random() * 800;
        y = 400;
        break;
      case 3: // left
        x = 0;
        y = Math.random() * 400;
        break;
    }
    
    setPathogens(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type: pathogenType.id,
        x,
        y,
        health: pathogenType.health,
        maxHealth: pathogenType.health,
        speed: pathogenType.speed * gameSpeed(),
        damage: pathogenType.damage,
        reward: pathogenType.reward,
        color: pathogenType.color,
        letter: pathogenType.letter
      }
    ]);
  };
  
  const placeImmuneCell = (e) => {
    if (gameState() !== 'playing' || !selectedCell()) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellType = CELL_TYPES.find(c => c.id === selectedCell());
    
    if (resources() >= cellType.cost) {
      setResources(r => r - cellType.cost);
      setImmuneCells(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          type: cellType.id,
          x,
          y,
          damage: cellType.damage,
          range: cellType.range,
          fireRate: cellType.fireRate,
          lastFire: 0,
          color: cellType.color,
          letter: cellType.letter
        }
      ]);
      
      addEffect(x, y, 'place');
    } else {
      addNotification("Not enough resources!", 'error');
    }
  };
  
  const activateSpecialAbility = (abilityType) => {
    const ability = specialAbilities()[abilityType];
    
    if (ability.cooldown > 0) {
      addNotification(`${abilityType} ability on cooldown!`, 'warning');
      return;
    }
    
    setSpecialAbilities(prev => {
      const updated = { ...prev };
      
      if (abilityType === 'freeze') {
        updated[abilityType] = { ...ability, active: true, startTime: Date.now(), cooldown: ability.maxCooldown };
        addNotification("Time Freeze activated! Pathogens slowed down!", 'success');
        
        // Add visual effect
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            pathogens().forEach(pathogen => {
              addEffect(pathogen.x, pathogen.y, 'freeze', 500);
            });
          }, i * 100);
        }
      } 
      else if (abilityType === 'boost') {
        updated[abilityType] = { ...ability, active: true, startTime: Date.now(), cooldown: ability.maxCooldown };
        addNotification("Damage Boost activated! Cells deal 50% more damage!", 'success');
        
        // Add visual effect
        immuneCells().forEach(cell => {
          addEffect(cell.x, cell.y, 'boost', 1000);
        });
      }
      else if (abilityType === 'bomb') {
        updated[abilityType] = { ...ability, cooldown: ability.maxCooldown };
        addNotification("Antibiotic Bomb activated! All pathogens damaged!", 'success');
        
        // Damage all pathogens
        setPathogens(prev => 
          prev.map(pathogen => {
            const newHealth = pathogen.health - 30;
            if (newHealth <= 0) {
              setResources(r => r + pathogen.reward);
              setScore(s => s + pathogen.reward);
              
              if (waveActive()) {
                setPathogensDefeated(prev => prev + 1);
              }
              
              addEffect(pathogen.x, pathogen.y, 'defeat');
              return null;
            }
            addEffect(pathogen.x, pathogen.y, 'bomb');
            return { ...pathogen, health: newHealth };
          }).filter(Boolean)
        );
      }
      
      return updated;
    });
  };
  
  const togglePause = () => {
    if (gameState() === 'playing') {
      setGameState('paused');
      clearInterval(gameInterval);
      clearInterval(spawnInterval);
      clearInterval(waveInterval);
      clearInterval(effectInterval);
    } else if (gameState() === 'paused') {
      setGameState('playing');
      gameInterval = setInterval(updateGame, 1000 / 30);
      
      // Restore spawn intervals based on wave state
      if (waveActive()) {
        spawnInterval = setInterval(spawnPathogen, 1000);
      } else {
        spawnInterval = setInterval(spawnPathogen, 3000);
      }
      
      waveInterval = setInterval(startWave, 45000);
      effectInterval = setInterval(updateEffects, 100);
    }
  };
  
  const sellImmuneCell = (cellId) => {
    const cell = immuneCells().find(c => c.id === cellId);
    if (cell) {
      const cellType = CELL_TYPES.find(c => c.id === cell.type);
      const refundAmount = Math.floor(cellType.cost * 0.7); // 70% refund
      
      setResources(r => r + refundAmount);
      setImmuneCells(prev => prev.filter(c => c.id !== cellId));
      
      addNotification(`Sold ${cellType.name} for ${refundAmount} resources`, 'info');
      addEffect(cell.x, cell.y, 'sell');
    }
  };
  
  onCleanup(() => {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    clearInterval(waveInterval);
    clearInterval(effectInterval);
    if (notificationTimeout) clearTimeout(notificationTimeout);
  });
  
  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div class="w-full max-w-4xl flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold text-blue-800">Immune System Defense</h1>
        <button 
          onClick={() => setShowHelp(true)}
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Help
        </button>
      </div>
      
      {/* Notifications */}
      <div class="fixed top-4 right-4 z-50">
        {notifications().map(notification => (
          <div 
            key={notification.id}
            class={`px-4 py-2 rounded shadow-lg text-white mb-2 transform transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
      
      {gameState() === 'menu' && (
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4 text-center">Welcome to Immune System Defense!</h2>
          <p class="mb-4">Defend your body against pathogens by strategically placing immune cells.</p>
          <ul class="mb-4 list-disc pl-5">
            <li>Each immune cell has strengths and weaknesses</li>
            <li>Periodic waves bring double the pathogens at double speed</li>
            <li>Pathogens attack from all directions, moving toward the center</li>
            <li>Use special abilities strategically in tough situations</li>
            <li>Sell cells to reclaim resources and adjust your strategy</li>
            <li>Game speed increases as you place more cells!</li>
          </ul>
          <button 
            onClick={startGame}
            class="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Start Game
          </button>
        </div>
      )}
      
      {(gameState() === 'playing' || gameState() === 'paused') && (
        <div class="w-full max-w-4xl">
          <div class="flex justify-between items-center mb-4 bg-white p-3 rounded shadow">
            <div class="flex space-x-4">
              <div>
                <span class="font-semibold">Health:</span>
                <div class="w-32 h-4 bg-gray-200 rounded">
                  <div 
                    class="h-full bg-red-500 rounded" 
                    style={{ width: `${health()}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <span class="font-semibold">Resources:</span>
                <span class="ml-2">{resources()}</span>
              </div>
              <div>
                <span class="font-semibold">Score:</span>
                <span class="ml-2">{score()}</span>
              </div>
              <div>
                <span class="font-semibold">Level:</span>
                <span class="ml-2">{level()}</span>
              </div>
              <div>
                <span class="font-semibold">Speed:</span>
                <span class="ml-2">{gameSpeed()}x</span>
              </div>
            </div>
            <button 
              onClick={togglePause}
              class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              {gameState() === 'playing' ? 'Pause' : 'Resume'}
            </button>
          </div>
          
          {/* Wave Progress */}
          {waveActive() && (
            <div class="mb-4 bg-white p-3 rounded shadow border-2 border-yellow-400">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-yellow-600">WAVE ACTIVE!</span>
                <span>Defeated: {pathogensDefeated()}/{pathogensInWave()}</span>
              </div>
              <div class="w-full h-4 bg-gray-200 rounded">
                <div 
                  class="h-full bg-yellow-500 rounded" 
                  style={{ width: `${waveProgress()}%` }}
                ></div>
              </div>
              <div class="text-xs text-yellow-600 mt-1">
                Double pathogens and speed during wave!
              </div>
            </div>
          )}
          
          {/* Special Abilities */}
          <div class="flex justify-between mb-4 bg-white p-3 rounded shadow">
            <div class="flex space-x-3">
              <button 
                onClick={() => activateSpecialAbility('freeze')}
                disabled={specialAbilities().freeze.cooldown > 0}
                class={`px-3 py-2 rounded flex flex-col items-center ${
                  specialAbilities().freeze.cooldown > 0 ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <span>❄️ Freeze</span>
                <span class="text-xs">
                  {specialAbilities().freeze.cooldown > 0 ? 
                    `${Math.ceil(specialAbilities().freeze.cooldown / 1000)}s` : 'Ready'}
                </span>
              </button>
              
              <button 
                onClick={() => activateSpecialAbility('boost')}
                disabled={specialAbilities().boost.cooldown > 0}
                class={`px-3 py-2 rounded flex flex-col items-center ${
                  specialAbilities().boost.cooldown > 0 ? 'bg-gray-300 text-gray-500' : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <span>⚡ Boost</span>
                <span class="text-xs">
                  {specialAbilities().boost.cooldown > 0 ? 
                    `${Math.ceil(specialAbilities().boost.cooldown / 1000)}s` : 'Ready'}
                </span>
              </button>
              
              <button 
                onClick={() => activateSpecialAbility('bomb')}
                disabled={specialAbilities().bomb.cooldown > 0}
                class={`px-3 py-2 rounded flex flex-col items-center ${
                  specialAbilities().bomb.cooldown > 0 ? 'bg-gray-300 text-gray-500' : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                <span>💣 Bomb</span>
                <span class="text-xs">
                  {specialAbilities().bomb.cooldown > 0 ? 
                    `${Math.ceil(specialAbilities().bomb.cooldown / 1000)}s` : 'Ready'}
                </span>
              </button>
            </div>
          </div>
          
          <div class="flex">
            <div class="w-3/4">
              <div 
                class="relative bg-gray-200 h-96 rounded overflow-hidden cursor-pointer"
                onClick={placeImmuneCell}
              >
                {/* Body center indicator */}
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-red-200 border-4 border-red-400 flex items-center justify-center">
                  <span class="text-red-600 font-bold">BODY</span>
                </div>
                
                {/* Immune cells */}
                {immuneCells().map(cell => (
                  <div 
                    class={`absolute w-8 h-8 rounded-full ${cell.color} border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white font-bold cursor-pointer`}
                    style={{ left: `${cell.x}px`, top: `${cell.y}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Sell this ${CELL_TYPES.find(c => c.id === cell.type).name} for ${Math.floor(CELL_TYPES.find(c => c.id === cell.type).cost * 0.7)} resources?`)) {
                        sellImmuneCell(cell.id);
                      }
                    }}
                  >
                    {cell.letter}
                    <div class="absolute w-16 h-16 rounded-full border-2 border-blue-300 opacity-50"></div>
                  </div>
                ))}
                
                {/* Pathogens */}
                {pathogens().map(pathogen => {
                  const pathogenType = PATHOGEN_TYPES.find(p => p.id === pathogen.type);
                  return (
                    <div 
                      class={`absolute w-6 h-6 rounded-full ${pathogenType.color} border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white font-bold text-xs ${specialAbilities().freeze.active ? 'animate-pulse' : ''}`}
                      style={{ left: `${pathogen.x}px`, top: `${pathogen.y}px` }}
                    >
                      {pathogenType.letter}
                      <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded">
                        <div 
                          class="h-full bg-green-500 rounded" 
                          style={{ width: `${(pathogen.health / pathogen.maxHealth) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Projectiles */}
                {projectiles().map(projectile => (
                  <div 
                    class={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                      projectile.type === 'macrophage' ? 'bg-blue-300' :
                      projectile.type === 'neutrophil' ? 'bg-purple-300' :
                      projectile.type === 'tcell' ? 'bg-green-300' : 'bg-yellow-300'
                    }`}
                    style={{ left: `${projectile.x}px`, top: `${projectile.y}px` }}
                  ></div>
                ))}
                
                {/* Visual effects */}
                {effects().map(effect => (
                  <div 
                    class={`absolute w-12 h-12 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
                      effect.type === 'defeat' ? 'bg-green-400 opacity-70 animate-ping' :
                      effect.type === 'damage' ? 'bg-red-400 opacity-70 animate-ping' :
                      effect.type === 'place' ? 'bg-blue-400 opacity-70 animate-ping' :
                      effect.type === 'sell' ? 'bg-yellow-400 opacity-70 animate-ping' :
                      effect.type === 'freeze' ? 'bg-blue-200 opacity-50' :
                      effect.type === 'boost' ? 'bg-yellow-300 opacity-50 animate-pulse' :
                      effect.type === 'bomb' ? 'bg-purple-400 opacity-70 animate-ping' :
                      effect.type === 'effective' ? 'bg-green-300 opacity-70 animate-ping' :
                      effect.type === 'ineffective' ? 'bg-red-300 opacity-70 animate-ping' : ''
                    }`}
                    style={{ left: `${effect.x}px`, top: `${effect.y}px` }}
                  ></div>
                ))}
                
                {gameState() === 'paused' && (
                  <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div class="text-white text-2xl font-bold">PAUSED</div>
                  </div>
                )}
              </div>
            </div>
            
            <div class="w-1/4 ml-4">
              <div class="bg-white p-4 rounded shadow">
                <h3 class="font-bold mb-2">Immune Cells</h3>
                <div class="space-y-2">
                  {CELL_TYPES.map(cell => (
                    <div 
                      class={`p-2 rounded cursor-pointer transition ${selectedCell() === cell.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => setSelectedCell(cell.id)}
                    >
                      <div class="flex justify-between items-center">
                        <div class="flex items-center">
                          <div class={`w-6 h-6 rounded-full ${cell.color} flex items-center justify-center text-white text-xs font-bold mr-2`}>
                            {cell.letter}
                          </div>
                          <span class="font-medium">{cell.name}</span>
                        </div>
                        <span class="text-yellow-600">💰 {cell.cost}</span>
                      </div>
                      <div class="text-xs text-gray-600 ml-8">
                        Damage: {cell.damage} | Range: {cell.range}
                      </div>
                      <div class="text-xs mt-1 ml-8">
                        <div class="text-green-600">
                          Strong vs: {cell.strengths.map(s => PATHOGEN_TYPES.find(p => p.id === s).letter).join(', ')}
                        </div>
                        {cell.weaknesses.length > 0 && (
                          <div class="text-red-600">
                            Weak vs: {cell.weaknesses.map(w => PATHOGEN_TYPES.find(p => p.id === w).letter).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <h3 class="font-bold mt-4 mb-2">Game Speed</h3>
                <div class="flex space-x-2">
                  {[1, 2, 3].map(speed => (
                    <button 
                      class={`flex-1 py-1 rounded ${gameSpeed() === speed ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => setGameSpeed(speed)}
                      disabled={immuneCells().length > 5}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                {immuneCells().length > 5 && (
                  <p class="text-xs text-gray-500 mt-1">Speed auto-increases with more cells</p>
                )}
                
                <div class="mt-4 text-sm text-gray-600">
                  <p class="mb-1"><span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> Bacteria (B)</p>
                  <p class="mb-1"><span class="inline-block w-3 h-3 bg-red-300 rounded-full mr-1"></span> Virus (V)</p>
                  <p class="mb-1"><span class="inline-block w-3 h-3 bg-red-700 rounded-full mr-1"></span> Fungus (F)</p>
                  <p class="mb-1"><span class="inline-block w-3 h-3 bg-red-900 rounded-full mr-1"></span> Parasite (P)</p>
                  <p><span class="inline-block w-3 h-3 bg-gradient-to-r from-red-500 to-purple-600 rounded-full mr-1"></span> Superbug (S)</p>
                </div>
                
                <div class="mt-4 p-2 bg-yellow-50 rounded text-xs">
                  <p class="font-semibold">Wave Info:</p>
                  <p>Waves double the pathogens and speed! Prepare your defenses!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {gameState() === 'gameOver' && (
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4 text-center text-red-600">Game Over!</h2>
          <p class="text-center mb-2">Your final score: <span class="font-bold">{score()}</span></p>
          <p class="text-center mb-4">You reached level: <span class="font-bold">{level()}</span></p>
          <button 
            onClick={startGame}
            class="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Play Again
          </button>
        </div>
      )}
      
      {/* Help Popup */}
      {showHelp() && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-blue-800">How to Play Immune System Defense</h2>
                <button 
                  onClick={() => setShowHelp(false)}
                  class="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div class="space-y-4">
                <div>
                  <h3 class="text-xl font-semibold mb-2">Objective</h3>
                  <p>Defend your body against pathogens by strategically placing immune cells. Pathogens attack from all directions, moving toward the center of your body (marked in red).</p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-2">Wave System</h3>
                  <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Double Challenge:</strong> Waves double both the number of pathogens and their speed</li>
                    <li><strong>Faster Spawning:</strong> During waves, pathogens spawn much more frequently</li>
                    <li><strong>Limited Duration:</strong> Each wave lasts 30 seconds or until all pathogens are defeated</li>
                    <li><strong>Rewards:</strong> Surviving waves grants bonus resources</li>
                  </ul>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-2">Game Mechanics</h3>
                  <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Free Movement:</strong> Pathogens enter from random edges and move toward the center</li>
                    <li><strong>Effectiveness System:</strong> Each immune cell has strengths and weaknesses against different pathogens</li>
                    <li><strong>Resource Management:</strong> Spend resources wisely on cells and sell them to adjust strategy</li>
                  </ul>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-2">Immune Cell Strategies</h3>
                  <div class="grid grid-cols-1 gap-3">
                    {CELL_TYPES.map(cell => (
                      <div class="border rounded p-3">
                        <div class="flex items-center mb-2">
                          <div class={`w-6 h-6 rounded-full ${cell.color} flex items-center justify-center text-white text-xs font-bold mr-2`}>
                            {cell.letter}
                          </div>
                          <span class="font-medium">{cell.name}</span>
                        </div>
                        <p class="text-sm mb-2">{cell.description}</p>
                        <div class="text-sm">
                          <p class="text-green-600">
                            <strong>Effective against:</strong> {cell.strengths.map(s => PATHOGEN_TYPES.find(p => p.id === s).name).join(', ')}
                          </p>
                          {cell.weaknesses.length > 0 && (
                            <p class="text-red-600">
                              <strong>Ineffective against:</strong> {cell.weaknesses.map(w => PATHOGEN_TYPES.find(p => p.id === w).name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-2">Advanced Strategies</h3>
                  <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Prepare for Waves:</strong> Build up your defenses before waves hit</li>
                    <li><strong>360° Defense:</strong> Since pathogens can attack from any direction, place cells to cover all approaches</li>
                    <li><strong>Save Abilities:</strong> Use special abilities during waves when overwhelmed</li>
                    <li><strong>Adapt Strategy:</strong> Sell and replace cells based on the pathogens you're facing</li>
                  </ul>
                </div>
              </div>
              
              <div class="mt-6 text-center">
                <button 
                  onClick={() => setShowHelp(false)}
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImmuneSystemDefense;