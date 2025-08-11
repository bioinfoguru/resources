import { createSignal, createEffect } from 'solid-js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js plugin
Chart.register(ChartDataLabels);

// DSSP Secondary Structure Colors
const dsspColors = {
    'H': '#FF0000',  // Alpha helix - Red
    'B': '#0000FF',  // Beta bridge - Blue
    'E': '#0000FF',  // Extended strand (beta sheet) - Blue
    'G': '#FFA500',  // 3-10 helix - Orange
    'I': '#800080',  // Pi helix - Purple
    'T': '#00FF00',  // Turn - Green
    'S': '#FFFF00',  // Bend - Yellow
    'C': '#808080',  // Coil - Grey
    ' ': '#808080'   // Coil (space) - Grey
};

// Secondary structure full names with Greek letters
const structureNames = {
    'H': 'α-Helix',      // Alpha helix
    'B': 'β-Bridge',     // Beta bridge
    'E': 'β-Strand',     // Beta strand
    'G': '3₁₀-Helix',    // 3-10 helix
    'I': 'π-Helix',      // Pi helix
    'T': 'Turn',         // Turn
    'S': 'Bend',         // Bend
    'C': 'Coil',         // Coil
    ' ': 'Coil'          // Coil
};

export default function ProteinVisualizerApp() {
    // Signals for reactive state management
    const [proteinData, setProteinData] = createSignal([]);
    const [isFileUploaded, setIsFileUploaded] = createSignal(false);
    const [fileName, setFileName] = createSignal('');
    const [fileSize, setFileSize] = createSignal('');
    const [isLoading, setIsLoading] = createSignal(false);
    const [isDragOver, setIsDragOver] = createSignal(false);
    const [residuesPerLine, setResiduesPerLine] = createSignal(50);
    const [startRes, setStartRes] = createSignal('');
    const [endRes, setEndRes] = createSignal('');

    // Refs for DOM elements
    let fileInputRef;
    let canvasRef;
    let structureChartRef;
    let solventChartRef;

    // Chart instances
    let structureChart = null;
    let solventChart = null;

    const handleFileUpload = (file) => {
        if (!file.name.match(/\.(dssp|txt)$/i)) {
            alert('Please upload a .dssp or .txt file');
            return;
        }

        setFileName(file.name);
        setFileSize(`${(file.size / 1024).toFixed(2)} KB`);
        setIsFileUploaded(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            parseDSSP(e.target.result);
        };
        reader.readAsText(file);
    };

    const parseDSSP = (content) => {
        setIsLoading(true);
        
        setTimeout(() => {
            const lines = content.split('\n');
            const newProteinData = [];
            
            // Skip all lines till there is a line starting with "  #  RESIDUE AA STRUCTURE"
            let dataLines = [];
            let startParsing = false;
            
            for (let line of lines) {
                if (line.startsWith('  #  RESIDUE AA STRUCTURE')) {
                    startParsing = true;
                    continue;
                }
                if (startParsing) {
                    dataLines.push(line);
                }
            }

            dataLines.forEach(line => {
                const residueNumber = parseInt(line.substring(5, 10).trim());
                const aminoAcid = line.substring(13, 14).trim();
                const structure = line.substring(16, 17).trim();
                const solventAccessibility = parseFloat(line.substring(34, 38).trim()) || 0;
                
                if (residueNumber && aminoAcid) {
                    newProteinData.push({
                        residueNumber: residueNumber,
                        aminoAcid: aminoAcid,
                        structure: structure,
                        solventAccessibility: solventAccessibility
                    });
                }
            });

            if (newProteinData.length === 0) {
                alert('No valid DSSP data found in the file. Please check your DSSP file format.');
                setIsLoading(false);
                return;
            }

            setProteinData(newProteinData);
            setIsLoading(false);
        }, 500);
    };

    const drawHelix = (ctx, xStart, xEnd, yPos, color, height = 0.5) => {
        const numPoints = Math.max((xEnd - xStart + 1) * 20, 40);
        const xRange = [];
        for (let i = 0; i < numPoints; i++) {
            xRange.push(xStart - 0.4 + (xEnd - xStart + 0.8) * i / (numPoints - 1));
        }
        
        const amplitude = height * 0.25 * 20;
        const frequency = 2.5;
        
        // Draw main helix
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        for (let i = 0; i < xRange.length; i++) {
            const x = xRange[i] * 20;
            const y = yPos + amplitude * Math.sin(frequency * Math.PI * xRange[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw offset layer
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        for (let i = 0; i < xRange.length; i++) {
            const x = xRange[i] * 20;
            const y = yPos + amplitude * 0.6 * Math.sin(frequency * Math.PI * xRange[i] + Math.PI/3);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw highlight layer
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        for (let i = 0; i < xRange.length; i++) {
            const x = xRange[i] * 20;
            const y = yPos + amplitude * 0.3 * Math.sin(frequency * Math.PI * xRange[i] + Math.PI/6);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        ctx.globalAlpha = 1.0;
    };

    const drawArrow = (ctx, x1, y1, x2, y2, color, thickness = 2) => {
        const headSize = 8;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 - headSize * Math.cos(angle), y2 - headSize * Math.sin(angle));
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headSize * Math.cos(angle - Math.PI/6), y2 - headSize * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - headSize * Math.cos(angle + Math.PI/6), y2 - headSize * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
    };

    const drawEllipse = (ctx, xStart, xEnd, yPos, color) => {
        const centerX = (xStart + xEnd) / 2;
        const radiusX = (xEnd - xStart) / 2;
        const radiusY = 6;
        
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(centerX, yPos, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    };

    const drawCoilBar = (ctx, xStart, xEnd, yPos, color) => {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(xStart - 2, yPos - 6, xEnd - xStart + 4, 12);
        ctx.globalAlpha = 1.0;
    };

    const visualizeStructure = () => {
        if (!canvasRef) return;
        
        const ctx = canvasRef.getContext('2d');
        const data = proteinData();
        
        const startResValue = startRes() ? parseInt(startRes()) : null;
        const endResValue = endRes() ? parseInt(endRes()) : null;
        
        // Filter by residue range if specified
        let filteredData = [...data];
        if (startResValue !== null && endResValue !== null) {
            filteredData = data.filter(res => 
                res.residueNumber >= startResValue && res.residueNumber <= endResValue
            );
        }
        
        const totalResidues = filteredData.length;
        const numLines = Math.ceil(totalResidues / residuesPerLine());
        
        // Set canvas size
        canvasRef.width = Math.max(1000, residuesPerLine() * 20 + 100);
        canvasRef.height = numLines * 80 + 60;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
        
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        
        for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
            const startIdx = lineIdx * residuesPerLine();
            const endIdx = Math.min(startIdx + residuesPerLine(), totalResidues);
            const lineData = filteredData.slice(startIdx, endIdx);
            
            const yBase = 40 + lineIdx * 80;
            
            // Draw secondary structures - grouping consecutive elements
            if (lineData.length > 0) {
                let i = 0;
                while (i < lineData.length) {
                    const currentSS = lineData[i].structure;
                    let j = i + 1;
                    
                    // Group consecutive same structures
                    while (j < lineData.length && lineData[j].structure === currentSS) {
                        j++;
                    }
                    
                    const groupEnd = j - 1;
                    const groupStart = i;
                    const xStart = (groupStart + 1) * 20;
                    const xEnd = (groupEnd + 1) * 20;
                    const color = dsspColors[currentSS] || '#808080';
                    
                    // Draw the group based on structure type
                    if (currentSS === 'H') {
                        drawHelix(ctx, groupStart + 1, groupEnd + 1, yBase, color, 0.6);
                    } else if (currentSS === 'E') {
                        drawArrow(ctx, xStart, yBase, xEnd, yBase, color, 8);
                    } else if (currentSS === 'B') {
                        drawArrow(ctx, xStart, yBase, xEnd, yBase, color, 6);
                    } else if (currentSS === 'G') {
                        drawHelix(ctx, groupStart + 1, groupEnd + 1, yBase, color, 0.4);
                    } else if (currentSS === 'I') {
                        drawHelix(ctx, groupStart + 1, groupEnd + 1, yBase, color, 0.35);
                    } else if (currentSS === 'T' || currentSS === 'S') {
                        let k = groupEnd + 1;
                        while (k < lineData.length && (lineData[k].structure === 'T' || lineData[k].structure === 'S')) {
                            k++;
                        }
                        const bendGroupEnd = k - 1;
                        const bendXEnd = (bendGroupEnd + 1) * 20;
                        
                        if (bendGroupEnd === groupStart) {
                            const centerX = xStart;
                            const radius = 6;
                            ctx.fillStyle = color;
                            ctx.globalAlpha = 0.8;
                            ctx.beginPath();
                            ctx.arc(centerX, yBase, radius, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.globalAlpha = 1.0;
                        } else {
                            drawEllipse(ctx, xStart, bendXEnd, yBase, color);
                        }
                        j = k;
                    } else {
                        let k = groupEnd + 1;
                        while (k < lineData.length && (lineData[k].structure === 'C' || lineData[k].structure === ' ')) {
                            k++;
                        }
                        const coilGroupEnd = k - 1;
                        const coilXEnd = (coilGroupEnd + 1) * 20;
                        drawCoilBar(ctx, xStart, coilXEnd, yBase, color);
                        j = k;
                    }
                    
                    i = j;
                }
            }
            
            // Draw amino acids and residue numbers
            ctx.fillStyle = 'black';
            ctx.font = 'bold 12px monospace';
            for (let i = 0; i < lineData.length; i++) {
                const xPos = (i + 1) * 20;
                
                if (lineData[i].residueNumber % 10 === 0 || i === 0) {
                    ctx.font = '10px monospace';
                    ctx.fillStyle = 'gray';
                    ctx.fillText(lineData[i].residueNumber.toString(), xPos, yBase + 25);
                    ctx.font = 'bold 12px monospace';
                    ctx.fillStyle = 'black';
                }
                
                ctx.fillText(lineData[i].aminoAcid, xPos, yBase + 40);
            }
        }
    };

    const createDistributionChart = () => {
        if (!structureChartRef) return;
        
        const ctx = structureChartRef.getContext('2d');
        const data = proteinData();
        
        if (structureChart) {
            structureChart.destroy();
        }
        
        // Count secondary structures
        const structureCounts = {};
        data.forEach(residue => {
            const structure = residue.structure;
            structureCounts[structure] = (structureCounts[structure] || 0) + 1;
        });
        
        const total = data.length;
        const structureData = Object.entries(structureCounts).map(([structure, count]) => ({
            structure: structure,
            count: count,
            percentage: ((count / total) * 100).toFixed(1),
            name: structureNames[structure] || structure
        })).sort((a, b) => b.count - a.count);
        
        const labels = structureData.map(item => item.name);
        const chartData = structureData.map(item => item.count);
        const percentages = structureData.map(item => item.percentage);
        const backgroundColors = structureData.map(item => dsspColors[item.structure] || '#808080');
        
        const maxCount = Math.max(...chartData);
        let tickInterval = 20;
        if (maxCount > 100) {
            tickInterval = 50;
        } else if (maxCount > 50) {
            tickInterval = 25;
        }
        
        structureChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Secondary Structure Distribution',
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace(')', ', 0.8)').replace('rgb', 'rgba')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Secondary Structure Elements',
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Count: ${context.parsed.y}, Percentage: ${percentages[context.dataIndex]}%`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: function(value, context) {
                            return percentages[context.dataIndex] + '%';
                        },
                        font: { weight: 'bold', size: 12 },
                        color: '#374151'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: tickInterval },
                        title: { display: true, text: 'Count' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        title: { display: true, text: 'Secondary Structure' },
                        grid: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    };

    const createSolventAccessibilityChart = () => {
        if (!solventChartRef) return;
        
        const ctx = solventChartRef.getContext('2d');
        const data = proteinData();
        
        if (solventChart) {
            solventChart.destroy();
        }
        
        const labels = data.map(res => res.residueNumber);
        const solventData = data.map(res => res.solventAccessibility);
        const maxValue = Math.max(...solventData) * 1.1;
        const minResidue = Math.min(...data.map(res => res.residueNumber));
        const maxResidue = Math.max(...data.map(res => res.residueNumber));
        
        solventChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Relative Solvent Accessibility',
                    data: solventData,
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Solvent Accessibility Profile',
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Residue ${context.label}: ${context.parsed.y.toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxValue,
                        title: { display: true, text: 'Accessibility' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        min: minResidue,
                        max: maxResidue,
                        title: { display: true, text: 'Residue Number' },
                        grid: { display: false }
                    }
                }
            }
        });
    };

    const downloadCanvas = () => {
        if (canvasRef) {
            const link = document.createElement('a');
            link.download = 'protein_secondary_structure.png';
            link.href = canvasRef.toDataURL();
            link.click();
        }
    };

    const removeFile = () => {
        setIsFileUploaded(false);
        setFileName('');
        setFileSize('');
        setProteinData([]);
        if (fileInputRef) fileInputRef.value = '';
    };

    // Effect to update visualizations when protein data changes
    createEffect(() => {
        if (proteinData().length > 0) {
            visualizeStructure();
            createDistributionChart();
            createSolventAccessibilityChart();
        }
    });

    // CSS styles object
    const styles = `
        .structure-container {
            position: relative;
            overflow-x: auto;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            background-color: white;
            margin-bottom: 20px;
        }
        
        .upload-area {
            transition: all 0.3s ease;
        }
        
        .upload-area.drag-over {
            background-color: #EFF6FF;
            border-color: #3B82F6;
            transform: scale(1.02);
        }
        
        .legend-item {
            transition: all 0.3s ease;
        }
        
        .legend-item:hover {
            transform: scale(1.05);
        }
        
        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .control-group {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .control-group label {
            font-weight: 600;
            color: #4B5563;
        }
        
        .control-group input {
            width: 80px;
            padding: 5px 8px;
            border: 1px solid #D1D5DB;
            border-radius: 4px;
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div class="bg-gray-50 min-h-screen">
                <div class="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Header */}
                    <header class="text-center mb-10">
                        <h1 class="text-4xl font-bold text-gray-800 mb-3">
                            <i class="fas fa-dna text-blue-600 mr-3"></i>
                            Protein Secondary Structure Visualizer
                        </h1>
                        <p class="text-gray-600 text-lg">Upload your DSSP output file to visualize protein secondary structure and solvent accessibility</p>
                    </header>

                    {/* Upload Section */}
                    <section class="mb-10">
                        <div class="bg-white rounded-xl shadow-lg p-8">
                            <h2 class="text-2xl font-semibold text-gray-800 mb-6">
                                <i class="fas fa-upload text-blue-500 mr-2"></i>
                                Upload DSSP File
                            </h2>
                            
                            <div 
                                class={`upload-area border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors ${isDragOver() ? 'drag-over' : ''}`}
                                onClick={() => fileInputRef.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(true);
                                }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(false);
                                    const files = e.dataTransfer.files;
                                    if (files.length > 0) {
                                        handleFileUpload(files[0]);
                                    }
                                }}
                            >
                                <i class="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4"></i>
                                <p class="text-xl text-gray-600 mb-2">Drag & drop your DSSP file here</p>
                                <p class="text-gray-500 mb-4">or</p>
                                <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                                    <i class="fas fa-folder-open mr-2"></i>
                                    Browse Files
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept=".dssp,.txt" 
                                    class="hidden"
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            handleFileUpload(e.target.files[0]);
                                        }
                                    }}
                                />
                                <p class="text-sm text-gray-500 mt-4">Supported format: .dssp, .txt</p>
                            </div>

                            {isFileUploaded() && (
                                <div class="mt-6">
                                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center">
                                                <i class="fas fa-file-alt text-blue-500 text-2xl mr-3"></i>
                                                <div>
                                                    <p class="font-semibold text-gray-800">{fileName()}</p>
                                                    <p class="text-sm text-gray-600">{fileSize()}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={removeFile}
                                                class="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <i class="fas fa-times-circle text-2xl"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Controls */}
                    {proteinData().length > 0 && (
                        <section class="mb-6">
                            <div class="bg-white rounded-xl shadow-lg p-6">
                                <div class="controls">
                                    <div class="control-group">
                                        <label for="residuesPerLine">Residues per line:</label>
                                        <input 
                                            type="number" 
                                            id="residuesPerLine" 
                                            value={residuesPerLine()} 
                                            min="20" 
                                            max="100"
                                            onInput={(e) => setResiduesPerLine(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div class="control-group">
                                        <label for="startRes">Start residue:</label>
                                        <input 
                                            type="number" 
                                            id="startRes" 
                                            placeholder="Optional"
                                            value={startRes()}
                                            onInput={(e) => setStartRes(e.target.value)}
                                        />
                                    </div>
                                    <div class="control-group">
                                        <label for="endRes">End residue:</label>
                                        <input 
                                            type="number" 
                                            id="endRes" 
                                            placeholder="Optional"
                                            value={endRes()}
                                            onInput={(e) => setEndRes(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={visualizeStructure}
                                        class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        <i class="fas fa-sync-alt mr-2"></i>Update Visualization
                                    </button>
                                    <button 
                                        onClick={downloadCanvas}
                                        class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        <i class="fas fa-download mr-2"></i>Download Image
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Visualization Section */}
                    {proteinData().length > 0 && (
                        <section>
                            <div class="bg-white rounded-xl shadow-lg p-8">
                                <div class="flex justify-between items-center mb-6">
                                    <h2 class="text-2xl font-semibold text-gray-800">
                                        <i class="fas fa-chart-bar text-green-500 mr-2"></i>
                                        Secondary Structure Visualization
                                    </h2>
                                </div>

                                {/* Legend */}
                                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 class="text-lg font-semibold text-gray-700 mb-3">Secondary Structure Legend</h3>
                                    <div class="flex flex-wrap gap-4">
                                        <div class="legend-item flex items-center">
                                            <div class="w-8 h-8 bg-red-500 rounded mr-2"></div>
                                            <span class="text-gray-700 font-medium">Alpha Helix (H)</span>
                                        </div>
                                        <div class="legend-item flex items-center">
                                            <div class="w-8 h-8 bg-blue-500 rounded mr-2"></div>
                                            <span class="text-gray-700 font-medium">Beta Strand (E)</span>
                                        </div>
                                        <div class="legend-item flex items-center">
                                            <div class="w-8 h-8 bg-orange-500 rounded mr-2"></div>
                                            <span class="text-gray-700 font-medium">3₁₀ Helix (G)</span>
                                        </div>
                                        <div class="legend-item flex items-center">
                                            <div class="w-8 h-8 bg-purple-500 rounded mr-2"></div>
                                            <span class="text-gray-700 font-medium">Pi Helix (I)</span>
                                        </div>
                                        <div class="legend-item flex items-center">
                                            <div class="w-8 h-8 bg-green-500 rounded mr-2"></div>
                                            <span class="text-gray-700 font-medium">Turn (T)</span>
                                        </div>
                                        <div class="legend-item flex items-center">
                                            <div class="w-8 h-8 bg-yellow-500 rounded mr-2"></div>
                                            <span class="text-gray-700 font-medium">Bend (S)</span>
                                        </div>
                                        <div class="legend-item flex items-center">
                                            <div class="w-8 h-8 bg-gray-500 rounded mr-2"></div>
                                            <span class="text-gray-700 font-medium">Coil/Loop (C, )</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Structure Visualization */}
                                <div class="structure-container">
                                    <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto', 'background-color': 'white' }}></canvas>
                                </div>

                                {/* Distribution Chart */}
                                <div class="mb-6">
                                    <h3 class="text-lg font-semibold text-gray-700 mb-3">Secondary Structure Distribution</h3>
                                    <div class="chart-container" style={{ height: '300px' }}>
                                        <canvas ref={structureChartRef}></canvas>
                                    </div>
                                </div>

                                {/* Solvent Accessibility Chart */}
                                <div class="mb-6">
                                    <h3 class="text-lg font-semibold text-gray-700 mb-3">Residue-wise Solvent Accessibility</h3>
                                    <div class="chart-container" style="height: 300px;">
                                        <canvas ref={solventChartRef}></canvas>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Loading Overlay */}
                    {isLoading() && (
                        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                                <p class="text-lg text-gray-700">Processing your file...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
