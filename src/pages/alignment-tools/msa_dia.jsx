import { createSignal, onMount, createEffect } from 'solid-js';

// MSA Annotator Component
export default function MSADia() {
  // State variables
  const [sequences, setSequences] = createSignal([]);
  const [alignmentLength, setAlignmentLength] = createSignal(0);
  const [annotations, setAnnotations] = createSignal([]);
  const [selectedColor, setSelectedColor] = createSignal('#FF6B6B');
  const [selectedOpacity, setSelectedOpacity] = createSignal(0.7);
  const [selectedBorderWidth, setSelectedBorderWidth] = createSignal(2);
  const [selectionMode, setSelectionMode] = createSignal('region');
  const [annotationMode, setAnnotationMode] = createSignal('fill');
  const [currentSelection, setCurrentSelection] = createSignal(null);
  const [colorScheme, setColorScheme] = createSignal('none');
  const [zoom, setZoom] = createSignal(1.0);
  const [lineLength, setLineLength] = createSignal(60);
  const [currentRowStart, setCurrentRowStart] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStart, setDragStart] = createSignal({ x: 0, y: 0 });
  const [showViewer, setShowViewer] = createSignal(false);
  const [fileName, setFileName] = createSignal('');
  
  // Refs for DOM elements
  let canvasRef;
  let canvasContainerRef;
  let fileInputRef;
  
  // Color schemes
  const colorSchemes = {
    nucleotides: {
      'A': '#FF6B6B',
      'T': '#4ECDC4',
      'U': '#4ECDC4',
      'G': '#45B7D1',
      'C': '#FFA07A',
      '-': '#FFFFFF'
    },
    aminoAcids: {
      hydrophobic: ['A', 'I', 'L', 'M', 'F', 'W', 'Y', 'V'],
      polar: ['N', 'C', 'Q', 'S', 'T'],
      positive: ['R', 'H', 'K'],
      negative: ['D', 'E'],
      colors: {
        hydrophobic: '#D3D3D3',
        polar: '#87CEEB',
        positive: '#FF6347',
        negative: '#FFA500'
      }
    }
  };
  
  // Sample FASTA data
  const sampleMSAFasta = `>seq1
ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT
>seq2
ACGTACCTACGTGGACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT
>seq3
ACGTTCGTACGT--ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT
>seq4
ACGTACGTTCGTGGTCGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT
>seq5
ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT--
>seq6
ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTAC`;
  
  // Constants
  const cellWidth = 16;
  const cellHeight = 20;
  const sequenceNameWidth = 150;
  const rowHeight = 120;
  
  // Initialize component
  onMount(() => {
    setupCanvas();
    // Load sample data for testing
    loadSampleData();
    
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollCanvas(-200);
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollCanvas(200);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
  
  // Canvas setup
  const setupCanvas = () => {
    const canvas = canvasRef;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
  };
  
  // Resize canvas
  const resizeCanvas = () => {
    const canvas = canvasRef;
    const container = canvasContainerRef;
    if (!canvas || !container) return;
    
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(rect.width - 20, 800);
    
    if (sequences().length > 0) {
      const totalRows = Math.ceil(alignmentLength() / lineLength());
      const seqRowHeight = (sequences().length * (cellHeight * zoom() + 2)) + 35;
      const neededHeight = totalRows * seqRowHeight + 100;
      canvas.height = neededHeight;
      
      // Force a re-render after resizing
      setTimeout(() => {
        render();
      }, 10);
    } else {
      canvas.height = 600;
    }
    
    if (sequences().length > 0) {
      render();
    }
  };
  
  // File handling
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };
  
  const processFile = async (file) => {
    try {
      const text = await readFile(file);
      const parsedSequences = parseAlignment(text, file.name);
      
      if (parsedSequences && parsedSequences.length > 0) {
        setSequences(parsedSequences);
        setAlignmentLength(parsedSequences[0].sequence.length);
        setCurrentRowStart(0);
        setAnnotations([]);
        setFileName(file.name);
        setShowViewer(true);
        
        setTimeout(() => {
          resizeCanvas();
          render();
        }, 100);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error processing file: ${error.message}`);
    }
  };
  
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  const parseAlignment = (text, filename) => {
    try {
      const extension = filename.split('.').pop().toLowerCase();
      
      if (extension === 'fasta' || extension === 'fas' || text.includes('>')) {
        return parseFASTA(text);
      }
      
      throw new Error('Unsupported file format. Only FASTA files are supported.');
    } catch (error) {
      console.error('Error parsing alignment:', error);
      throw error;
    }
  };
  
  const parseFASTA = (text) => {
    try {
      const sequences = [];
      const lines = text.split('\n');
      let currentSeq = null;
      
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('>')) {
          if (currentSeq) {
            sequences.push(currentSeq);
          }
          currentSeq = {
            name: line.substring(1) || 'Unnamed sequence',
            sequence: ''
          };
        } else if (currentSeq && line) {
          currentSeq.sequence += line.toUpperCase();
        }
      }
      
      if (currentSeq) {
        sequences.push(currentSeq);
      }
      
      // Fix alignment by padding sequences to same length
      alignSequences(sequences);
      
      return sequences;
    } catch (error) {
      throw new Error('Error parsing FASTA format: ' + error.message);
    }
  };
  
  const alignSequences = (sequences) => {
    try {
      if (!sequences || sequences.length === 0) {
        throw new Error('No sequences found');
      }
      
      // Find the maximum sequence length
      let maxLength = 0;
      for (let seq of sequences) {
        if (seq.sequence && seq.sequence.length > maxLength) {
          maxLength = seq.sequence.length;
        }
      }
      
      // Pad all sequences to the same length with gaps
      for (let seq of sequences) {
        if (seq.sequence.length < maxLength) {
          const gapsNeeded = maxLength - seq.sequence.length;
          seq.sequence += '-'.repeat(gapsNeeded);
        }
      }
    } catch (error) {
      throw error;
    }
  };
  
  // Load sample data
  const loadSampleData = () => {
    try {
      const blob = new Blob([sampleMSAFasta], { type: 'text/plain' });
      const file = new File([blob], 'sample.fasta', { type: 'text/plain' });
      processFile(file);
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Error loading sample data: ' + error.message);
    }
  };
  
  // Rendering
  const render = () => {
    const canvas = canvasRef;
    if (!canvas || sequences().length === 0) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMultiRowAlignment(ctx);
    renderAnnotations(ctx);
    renderSelection(ctx);
  };
  
  const renderMultiRowAlignment = (ctx) => {
    try {
      const totalRows = Math.ceil(alignmentLength() / lineLength());
      let yOffset = 20;
      
      for (let row = 0; row < totalRows; row++) {
        const startPos = row * lineLength();
        const endPos = Math.min(startPos + lineLength(), alignmentLength());
        
        // Render position numbers for this row
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary') || '#666666';
        ctx.font = '10px monospace';
        ctx.fillText(`${startPos + 1}-${endPos}`, 5, yOffset);
        
        yOffset += 15;
        
        // Render sequences for this row
        for (let i = 0; i < sequences().length; i++) {
          // Sequence name
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text') || '#000000';
          ctx.font = '12px monospace';
          const name = sequences()[i].name || 'Unnamed';
          const truncated = name.length > 20 ? name.substring(0, 17) + '...' : name;
          ctx.fillText(truncated, 5, yOffset + 15);
          
          // Sequence characters
          for (let j = startPos; j < endPos; j++) {
            const residue = sequences()[i].sequence[j] || '-';
            const x = sequenceNameWidth + (j - startPos) * cellWidth * zoom();
            const y = yOffset;
            
            // Background color based on color scheme
            if (colorScheme() !== 'none') {
              const bgColor = getResidueColor(residue);
              if (bgColor) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(x, y, cellWidth * zoom(), cellHeight * zoom());
              }
            }
            
            // Text
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text') || '#000000';
            ctx.font = `${12 * zoom()}px monospace`;
            ctx.fillText(residue, x + 2, y + 14 * zoom());
          }
          
          yOffset += cellHeight * zoom() + 2;
        }
        
        yOffset += 20; // Space between row blocks
      }
    } catch (error) {
      console.error('Error rendering multi-row alignment:', error);
    }
  };
  
  const getResidueColor = (residue) => {
    try {
      if (colorScheme() === 'nucleotides') {
        return colorSchemes.nucleotides[residue] || '#FFFFFF';
      } else if (colorScheme() === 'aminoAcids') {
        const scheme = colorSchemes.aminoAcids;
        if (scheme.hydrophobic.includes(residue)) return scheme.colors.hydrophobic;
        if (scheme.polar.includes(residue)) return scheme.colors.polar;
        if (scheme.positive.includes(residue)) return scheme.colors.positive;
        if (scheme.negative.includes(residue)) return scheme.colors.negative;
      }
      return null;
    } catch (error) {
      console.error('Error getting residue color:', error);
      return null;
    }
  };
  
  const renderAnnotations = (ctx) => {
    try {
      for (let annotation of annotations()) {
        if (annotation.mode === 'border') {
          // Render border-only annotation
          ctx.strokeStyle = annotation.color;
          ctx.lineWidth = annotation.borderWidth || 2;
          ctx.setLineDash([]);
          
          const coords = getAnnotationCoordinates(annotation);
          if (coords) {
            ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);
          }
        } else {
          // Render filled annotation
          ctx.fillStyle = hexToRgba(annotation.color, annotation.opacity);
          
          const coords = getAnnotationCoordinates(annotation);
          if (coords) {
            ctx.fillRect(coords.x, coords.y, coords.width, coords.height);
          }
        }
      }
    } catch (error) {
      console.error('Error rendering annotations:', error);
    }
  };
  
  const renderSelection = (ctx) => {
    try {
      if (!currentSelection()) return;
      
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#4ECDC4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        currentSelection().x,
        currentSelection().y,
        currentSelection().width,
        currentSelection().height
      );
      ctx.setLineDash([]);
    } catch (error) {
      console.error('Error rendering selection:', error);
    }
  };
  
  const getAnnotationCoordinates = (annotation) => {
    try {
      const rowIndex = Math.floor(annotation.startPos / lineLength());
      const seqRowHeight = (sequences().length * (cellHeight * zoom() + 2)) + 35;
      const baseY = 20 + rowIndex * seqRowHeight + 15;
      
      if (annotation.type === 'residue') {
        const posInRow = annotation.position % lineLength();
        const x = sequenceNameWidth + posInRow * cellWidth * zoom();
        const y = baseY + annotation.sequence * (cellHeight * zoom() + 2);
        return {
          x: x,
          y: y,
          width: cellWidth * zoom(),
          height: cellHeight * zoom()
        };
      } else if (annotation.type === 'region') {
        const startPosInRow = annotation.startPos % lineLength();
        const x = sequenceNameWidth + startPosInRow * cellWidth * zoom();
        const y = baseY + annotation.startSeq * (cellHeight * zoom() + 2);
        const width = (annotation.endPos - annotation.startPos + 1) * cellWidth * zoom();
        const height = (annotation.endSeq - annotation.startSeq + 1) * (cellHeight * zoom() + 2);
        return { x, y, width, height };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting annotation coordinates:', error);
      return null;
    }
  };
  
  // Event handlers
  const handleMouseDown = (e) => {
    try {
      const canvas = canvasRef;
      const container = canvasContainerRef;
      if (!canvas || !container) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top + container.scrollTop;
      
      setIsDragging(true);
      setDragStart({ x, y });
    } catch (error) {
      console.error('Error handling mouse down:', error);
    }
  };
  
  const handleMouseMove = (e) => {
    try {
      const canvas = canvasRef;
      const container = canvasContainerRef;
      if (!canvas || !container) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top + container.scrollTop;
      
      if (isDragging()) {
        const minX = Math.min(dragStart().x, x);
        const maxX = Math.max(dragStart().x, x);
        const minY = Math.min(dragStart().y, y);
        const maxY = Math.max(dragStart().y, y);
        
        setCurrentSelection({
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        });
        
        render();
      }
    } catch (error) {
      console.error('Error handling mouse move:', error);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Canvas scrolling
  const scrollCanvas = (deltaY) => {
    const container = canvasContainerRef;
    if (container) {
      const newScrollTop = container.scrollTop + deltaY;
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
      
      // Update scroll info
      const scrollPercent = Math.round((container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100) || 0;
      const scrollInfo = document.getElementById('scrollInfo');
      if (scrollInfo) {
        scrollInfo.textContent = `Scroll: ${scrollPercent}%`;
      }
    }
  };
  
  // Control methods
  const changeColorScheme = (scheme) => {
    setColorScheme(scheme);
    render();
  };
  
  const changeLineLength = (length) => {
    setLineLength(parseInt(length));
    resizeCanvas();
    render();
  };
  
  const changeAnnotationMode = (mode) => {
    setAnnotationMode(mode);
  };
  
  const adjustZoom = (factor) => {
    const newZoom = Math.max(0.5, Math.min(3.0, zoom() * factor));
    setZoom(newZoom);
    resizeCanvas();
    render();
  };
  
  const selectColor = (color) => {
    setSelectedColor(color);
  };
  
  const updateOpacity = (value) => {
    setSelectedOpacity(parseFloat(value));
  };
  
  const updateBorderWidth = (value) => {
    setSelectedBorderWidth(parseInt(value));
  };
  
  const addAnnotation = () => {
    try {
      if (!currentSelection()) {
        alert('Please make a selection first');
        return;
      }
      
      const startPos = getPositionFromCoords(currentSelection().x, currentSelection().y);
      const endPos = getPositionFromCoords(
        currentSelection().x + currentSelection().width,
        currentSelection().y + currentSelection().height
      );
      
      const annotation = {
        id: Date.now(),
        type: selectionMode(),
        mode: annotationMode(),
        color: selectedColor(),
        opacity: selectedOpacity(),
        borderWidth: selectedBorderWidth(),
        startPos: startPos.position,
        endPos: endPos.position,
        startSeq: startPos.sequence,
        endSeq: endPos.sequence
      };
      
      if (selectionMode() === 'residue') {
        annotation.position = startPos.position;
        annotation.sequence = startPos.sequence;
      }
      
      setAnnotations([...annotations(), annotation]);
      setCurrentSelection(null);
      render();
    } catch (error) {
      console.error('Error adding annotation:', error);
      alert('Error adding annotation: ' + error.message);
    }
  };
  
  const removeAnnotation = (id) => {
    setAnnotations(annotations().filter(a => a.id !== id));
    render();
  };
  
  const clearAnnotations = () => {
    if (confirm('Clear all annotations?')) {
      setAnnotations([]);
      render();
    }
  };
  
  const getPositionFromCoords = (x, y) => {
    try {
      // Calculate which row block we're in
      const seqRowHeight = (sequences().length * (cellHeight * zoom() + 2)) + 35;
      const rowBlock = Math.floor((y - 20) / seqRowHeight);
      const yInBlock = (y - 20) % seqRowHeight - 15;
      
      // Calculate position within the row
      const posInRow = Math.floor((x - sequenceNameWidth) / (cellWidth * zoom()));
      const position = Math.max(0, Math.min(rowBlock * lineLength() + posInRow, alignmentLength() - 1));
      
      // Calculate sequence index
      const sequence = Math.max(0, Math.min(Math.floor(yInBlock / (cellHeight * zoom() + 2)), sequences().length - 1));
      
      return { position, sequence };
    } catch (error) {
      console.error('Error getting position from coords:', error);
      return { position: 0, sequence: 0 };
    }
  };
  
  // Export methods
  const downloadImage = () => {
    try {
      const canvas = canvasRef;
      if (!canvas || sequences().length === 0) {
        alert('No data to export');
        return;
      }
      
      const link = document.createElement('a');
      link.download = 'msa_annotated_multirow.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Error downloading image: ' + error.message);
    }
  };
  
  const downloadAnnotations = () => {
    try {
      const data = {
        filename: 'annotations.json',
        sequences: sequences().map(s => ({ name: s.name, length: s.sequence.length })),
        annotations: annotations(),
        lineLength: lineLength(),
        created: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = 'msa_annotations.json';
      link.href = URL.createObjectURL(blob);
      link.click();
    } catch (error) {
      console.error('Error downloading annotations:', error);
      alert('Error downloading annotations: ' + error.message);
    }
  };
  
  // Utility methods
  const hexToRgba = (hex, alpha) => {
    try {
      if (!hex || typeof hex !== 'string') return 'rgba(255, 255, 255, 0.7)';
      
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha || 0.7})`;
    } catch (error) {
      console.error('Error converting hex to rgba:', error);
      return 'rgba(255, 255, 255, 0.7)';
    }
  };
  
  return (
    <div class="app-container flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold text-gray-800">MSA Annotator</h1>
          <div class="flex gap-3">
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => fileInputRef?.click()}
            >
              Upload MSA File
            </button>
            <button 
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={downloadImage}
              disabled={sequences().length === 0}
            >
              Download Image
            </button>
            <button 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={downloadAnnotations}
              disabled={sequences().length === 0}
            >
              Export Annotations
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div class="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside class="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          {/* File Information */}
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-3">File Information</h3>
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
              {fileName() ? (
                <div class="space-y-1">
                  <p><span class="font-medium">File:</span> {fileName()}</p>
                  <p><span class="font-medium">Sequences:</span> {sequences().length}</p>
                  <p><span class="font-medium">Length:</span> {alignmentLength()}</p>
                  <p><span class="font-medium">Rows:</span> {Math.ceil(alignmentLength() / lineLength())}</p>
                </div>
              ) : (
                <p class="text-gray-500">No file loaded</p>
              )}
            </div>
          </div>

          {/* View Controls */}
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-3">View Controls</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
                <select 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={colorScheme()}
                  onChange={(e) => changeColorScheme(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="nucleotides">Nucleotides</option>
                  <option value="aminoAcids">Amino Acids</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Line Length</label>
                <select 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lineLength()}
                  onChange={(e) => changeLineLength(e.target.value)}
                >
                  <option value="50">50 characters</option>
                  <option value="55">55 characters</option>
                  <option value="60">60 characters</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Zoom Level</label>
                <div class="flex items-center gap-2">
                  <button 
                    class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => adjustZoom(0.8)}
                  >
                    -
                  </button>
                  <span class="text-sm w-16 text-center">{Math.round(zoom() * 100)}%</span>
                  <button 
                    class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => adjustZoom(1.2)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Annotation Tools */}
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Annotation Tools</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Selection Mode</label>
                <select 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectionMode()}
                  onChange={(e) => setSelectionMode(e.target.value)}
                >
                  <option value="residue">Single Residue</option>
                  <option value="region">Region</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Annotation Mode</label>
                <select 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={annotationMode()}
                  onChange={(e) => changeAnnotationMode(e.target.value)}
                >
                  <option value="fill">Fill</option>
                  <option value="border">Border Only</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Annotation Color</label>
              {/*  <div class="grid grid-cols-4 gap-2 mb-2">
                  {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#DDA0DD', '#98FB98', '#F0E68C', '#FFB6C1'].map((color) => (
                    <div
                      class={`w-8 h-8 rounded-md cursor-pointer border-2 transition-all duration-200 hover:scale-110 ${selectedColor() === color ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => selectColor(color)}
                    />
                  ))}
                </div> */}
                <input
                  type="color"
                  class="w-full h-10 rounded-md border border-gray-300 cursor-pointer"
                  value={selectedColor()}
                  onChange={(e) => selectColor(e.target.value)}
                />
              </div>
              {annotationMode() === 'fill' ? (
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="range" 
                      class="flex-1"
                      min="0.1" 
                      max="1" 
                      step="0.1" 
                      value={selectedOpacity()}
                      onChange={(e) => updateOpacity(e.target.value)}
                    />
                    <span class="text-sm w-12">{Math.round(selectedOpacity() * 100)}%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Border Width</label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="range" 
                      class="flex-1"
                      min="1" 
                      max="5" 
                      step="1" 
                      value={selectedBorderWidth()}
                      onChange={(e) => updateBorderWidth(e.target.value)}
                    />
                    <span class="text-sm w-12">{selectedBorderWidth()}px</span>
                  </div>
                </div>
              )}
              <div class="flex gap-2">
                <button 
                  class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={addAnnotation}
                >
                  Add Annotation
                </button>
                <button 
                  class="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={clearAnnotations}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Annotations List */}
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-3">Annotations</h3>
            <div class="max-h-48 overflow-y-auto space-y-2">
              {annotations().length === 0 ? (
                <p class="text-gray-500 text-sm">No annotations</p>
              ) : (
                annotations().map((annotation) => (
                  <div key={annotation.id} class="flex items-center justify-between p-2 bg-yellow-50 rounded-md border border-yellow-100">
                    <div class="flex items-center gap-2">
                      <div 
                        class="w-4 h-4 rounded-sm"
                        style={{ 
                          backgroundColor: annotation.mode === 'border' ? 'transparent' : annotation.color,
                          border: annotation.mode === 'border' ? `2px solid ${annotation.color}` : 'none'
                        }}
                      />
                      <div class="text-sm">
                        <p class="font-medium">{annotation.type} ({annotation.mode})</p>
                        <p class="text-gray-600 text-xs">
                          {annotation.type === 'residue' 
                            ? `Pos ${annotation.position + 1}, Seq ${annotation.sequence + 1}`
                            : `Pos ${annotation.startPos + 1}-${annotation.endPos + 1}, Seq ${annotation.startSeq + 1}-${annotation.endSeq + 1}`
                          }
                        </p>
                      </div>
                    </div>
                    <button 
                      class="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => removeAnnotation(annotation.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Viewer Area */}
        <div class="flex-1 flex flex-col bg-gray-100">
          {/* Upload Area (shown when no file loaded) */}
          {!showViewer() && (
            <div
              class="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 m-6 rounded-lg bg-white transition-colors"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef?.click()}
            >
              <div class="text-center p-8">
                <div class="text-6xl mb-4 opacity-70">📄</div>
                <h3 class="text-xl font-medium text-gray-800 mb-2">Upload Multiple Sequence Alignment</h3>
                <p class="text-gray-600 mb-4">Drag and drop FASTA files here, or click to browse</p>
                <button
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => fileInputRef?.click()}
                >
                  Browse Files
                </button>
                <p class="text-sm text-gray-500 mt-4">Supported formats: .fasta, .fas</p>
              </div>
            </div>
          )}

          {/* MSA Viewer (shown when file loaded) */}
          {showViewer() && (
            <div class="flex-1 flex flex-col bg-white">
              <div class="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div class="text-sm">
                  <span class="font-medium">{sequences().length} sequences</span>
                  <span class="mx-2">•</span>
                  <span>{alignmentLength()} positions</span>
                </div>
                <div class="text-sm text-gray-600">
                  Multi-row view ({Math.ceil(alignmentLength() / lineLength())} rows)
                </div>
              </div>
              <div
                ref={canvasContainerRef}
                class="flex-1 overflow-auto bg-gray-50 border"
                style={{
                  maxHeight: 'calc(100vh - 260px)',
                  maxWidth: '100%',
                  minHeight: '400px',
                  minWidth: '600px',
                  overflow: 'auto',
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
                onScroll={() => {
                  const container = canvasContainerRef;
                  if (container) {
                    const scrollPercent = Math.round((container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100) || 0;
                    const scrollInfo = document.getElementById('scrollInfo');
                    if (scrollInfo) {
                      scrollInfo.textContent = `Scroll: ${scrollPercent}%`;
                    }
                  }
                }}
              >
                <canvas
                  ref={canvasRef}
                  class="bg-white cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    display: 'block',
                    width: '100%',
                    minWidth: '1200px', // Make canvas wider than container for scroll
                  }}
                />
              </div>
              {/* Show scroll controls only if alignment is large enough to require scrolling */}
              {alignmentLength() > lineLength() * 2 && (
                <div class="flex justify-center items-center px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div class="flex items-center gap-3">
                    <button
                      class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                      onClick={() => scrollCanvas(-200)}
                    >
                      ▲
                    </button>
                    <span class="text-sm text-gray-600" id="scrollInfo">Scroll: 0%</span>
                    <button
                      class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                      onClick={() => scrollCanvas(200)}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div class="bg-white border-t border-gray-200 px-6 py-2 text-sm text-gray-600 flex justify-between items-center">
        <div>
          <span id="cursorPosition">Position: -</span>
          <span class="mx-2">•</span>
          <span id="selectionInfo">No selection</span>
        </div>
        <a href="#" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium" onClick={(e) => {
          e.preventDefault();
          // Open help modal
          const helpModal = document.createElement('div');
          helpModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
          helpModal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">MSA Annotator Help</h2>
                <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="prose max-w-none">
                <h3>Getting Started</h3>
                <p>Upload a FASTA file to begin annotating your multiple sequence alignment.</p>
                
                <h3>File Upload</h3>
                <p>Drag and drop your FASTA file onto the upload area, or click "Browse Files" to select a file from your computer.</p>
                
                <h3>View Controls</h3>
                <ul>
                  <li><strong>Color Scheme:</strong> Choose between None, Nucleotides, or Amino Acids coloring</li>
                  <li><strong>Line Length:</strong> Set the number of characters per line (50, 55, or 60)</li>
                  <li><strong>Zoom Level:</strong> Zoom in or out to adjust the size of the alignment</li>
                </ul>
                
                <h3>Annotation Tools</h3>
                <ul>
                  <li><strong>Selection Mode:</strong> Choose between Single Residue or Region selection</li>
                  <li><strong>Annotation Mode:</strong> Choose between Fill or Border Only</li>
                  <li><strong>Annotation Color:</strong> Select a color for your annotations</li>
                  <li><strong>Opacity:</strong> Adjust the transparency of filled annotations</li>
                  <li><strong>Border Width:</strong> Adjust the width of border-only annotations</li>
                </ul>
                
                <h3>Creating Annotations</h3>
                <p>1. Make a selection on the alignment by clicking and dragging</p>
                <p>2. Choose your annotation settings in the sidebar</p>
                <p>3. Click "Add Annotation" to save your annotation</p>
                
                <h3>Exporting</h3>
                <ul>
                  <li><strong>Download Image:</strong> Save the current view as a PNG image</li>
                  <li><strong>Export Annotations:</strong> Save all annotations as a JSON file</li>
                </ul>
              </div>
            </div>
          `;
          document.body.appendChild(helpModal);
        }}>
          <i class="fa fa-circle-question" aria-hidden="true"></i>
          Help
        </a>
      </div>


      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".fasta,.fas" 
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
}