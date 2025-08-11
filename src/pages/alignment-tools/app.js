// MSA Annotator Application
class MSAAnnotator {
    constructor() {
        this.sequences = [];
        this.alignmentLength = 0;
        this.annotations = [];
        this.selectedColor = '#FF6B6B';
        this.selectedOpacity = 0.7;
        this.selectedBorderWidth = 2;
        this.selectionMode = 'region'; // Default to region
        this.annotationMode = 'fill'; // Default annotation mode
        this.currentSelection = null;
        this.colorScheme = 'none'; // Default to none
        this.zoom = 1.0;
        this.lineLength = 60; // Characters per line
        this.currentRowStart = 0; // Current starting row for multi-row display
        this.cellWidth = 16;
        this.cellHeight = 20;
        this.sequenceNameWidth = 150;
        this.mouseDown = false;
        this.startX = 0;
        this.startY = 0;
        this.rowHeight = 120; // Height of each row block including spacing
        
        // Color schemes from application data
        this.colorSchemes = {
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
        
        this.annotationColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#DDA0DD', '#98FB98', '#F0E68C', '#FFB6C1'];
        
        // Fixed sample FASTA data - all sequences properly aligned with same length
        this.sampleMSAFasta = ">seq1\nACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT\n>seq2\nACGTACCTACGTGGACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT\n>seq3\nACGTTCGTACGT--ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT\n>seq4\nACGTACGTTCGTGGTCGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT\n>seq5\nACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT--\n>seq6\nACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTAC";
        
        this.init();
    }
    
    init() {
        try {
            this.initElements();
            this.initEventListeners();
            this.setupCanvas();
            this.setDefaults();
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    setDefaults() {
        try {
            // Set default values in UI
            if (this.colorSchemeSelect) {
                this.colorSchemeSelect.value = 'none';
            }
            if (this.selectionModeSelect) {
                this.selectionModeSelect.value = 'region';
            }
            if (this.lineLengthSelect) {
                this.lineLengthSelect.value = '60';
            }
            if (this.annotationModeSelect) {
                this.annotationModeSelect.value = 'fill';
            }
            
            // Initially hide border width controls
            if (this.borderWidthGroup) {
                this.borderWidthGroup.style.display = 'none';
            }
        } catch (error) {
            console.error('Error setting defaults:', error);
        }
    }
    
    initElements() {
        // Get all required DOM elements with null checks
        this.uploadArea = this.safeGetElement('uploadArea');
        this.msaViewer = this.safeGetElement('msaViewer');
        this.canvas = this.safeGetElement('msaCanvas');
        this.canvasContainer = this.safeGetElement('canvasContainer');
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        } else {
            throw new Error('Canvas element not found');
        }
        
        this.fileInput = this.safeGetElement('fileInput');
        this.loadingOverlay = this.safeGetElement('loadingOverlay');
        
        // Control elements
        this.uploadBtn = this.safeGetElement('uploadBtn');
        this.browseBtn = this.safeGetElement('browseBtn');
        this.downloadImageBtn = this.safeGetElement('downloadImageBtn');
        this.downloadAnnotationsBtn = this.safeGetElement('downloadAnnotationsBtn');
        this.colorSchemeSelect = this.safeGetElement('colorScheme');
        this.selectionModeSelect = this.safeGetElement('selectionMode');
        this.lineLengthSelect = this.safeGetElement('lineLength');
        this.annotationModeSelect = this.safeGetElement('annotationMode');
        this.zoomInBtn = this.safeGetElement('zoomIn');
        this.zoomOutBtn = this.safeGetElement('zoomOut');
        this.zoomLevel = this.safeGetElement('zoomLevel');
        this.addAnnotationBtn = this.safeGetElement('addAnnotation');
        this.clearAnnotationsBtn = this.safeGetElement('clearAnnotations');
        this.customColorPicker = this.safeGetElement('customColor');
        this.opacitySlider = this.safeGetElement('annotationOpacity');
        this.opacityValue = this.safeGetElement('opacityValue');
        this.borderWidthSlider = this.safeGetElement('borderWidth');
        this.borderWidthValue = this.safeGetElement('borderWidthValue');
        this.opacityGroup = this.safeGetElement('opacityGroup');
        this.borderWidthGroup = this.safeGetElement('borderWidthGroup');
        
        // Info elements
        this.fileInfo = this.safeGetElement('fileInfo');
        this.sequenceCount = this.safeGetElement('sequenceCount');
        this.alignmentLengthElement = this.safeGetElement('alignmentLength');
        this.currentView = this.safeGetElement('currentView');
        this.scrollInfo = this.safeGetElement('scrollInfo');
        this.cursorPosition = this.safeGetElement('cursorPosition');
        this.selectionInfo = this.safeGetElement('selectionInfo');
        this.annotationsList = this.safeGetElement('annotationsList');
        
        // Scroll controls (now for programmatic scrolling)
        this.scrollUpBtn = this.safeGetElement('scrollUp');
        this.scrollDownBtn = this.safeGetElement('scrollDown');
    }
    
    safeGetElement(id) {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id '${id}' not found`);
            }
            return element;
        } catch (error) {
            console.error(`Error getting element '${id}':`, error);
            return null;
        }
    }
    
    safeSetTextContent(element, text) {
        try {
            if (element && typeof element.textContent !== 'undefined') {
                element.textContent = text;
            }
        } catch (error) {
            console.error('Error setting text content:', error);
        }
    }
    
    safeSetInnerHTML(element, html) {
        try {
            if (element && typeof element.innerHTML !== 'undefined') {
                element.innerHTML = html;
            }
        } catch (error) {
            console.error('Error setting innerHTML:', error);
        }
    }
    
    safeAddClass(element, className) {
        try {
            if (element && element.classList) {
                element.classList.add(className);
            }
        } catch (error) {
            console.error('Error adding class:', error);
        }
    }
    
    safeRemoveClass(element, className) {
        try {
            if (element && element.classList) {
                element.classList.remove(className);
            }
        } catch (error) {
            console.error('Error removing class:', error);
        }
    }
    
    showError(message) {
        alert(message);
        console.error(message);
    }
    
    initEventListeners() {
        try {
            // File upload
            if (this.uploadBtn) {
                this.uploadBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.fileInput) this.fileInput.click();
                });
            }
            
            if (this.browseBtn) {
                this.browseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.fileInput) this.fileInput.click();
                });
            }
            
            if (this.fileInput) {
                this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
            }
            
            // Drag and drop
            if (this.uploadArea) {
                this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
                this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
                this.uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
            }
            
            // Download buttons
            if (this.downloadImageBtn) {
                this.downloadImageBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.downloadImage();
                });
            }
            if (this.downloadAnnotationsBtn) {
                this.downloadAnnotationsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.downloadAnnotations();
                });
            }
            
            // View controls
            if (this.colorSchemeSelect) {
                this.colorSchemeSelect.addEventListener('change', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.changeColorScheme(e.target.value);
                });
            }
            if (this.selectionModeSelect) {
                this.selectionModeSelect.addEventListener('change', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectionMode = e.target.value;
                });
            }
            if (this.lineLengthSelect) {
                this.lineLengthSelect.addEventListener('change', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.changeLineLength(parseInt(e.target.value));
                });
            }
            if (this.annotationModeSelect) {
                this.annotationModeSelect.addEventListener('change', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.changeAnnotationMode(e.target.value);
                });
            }
            if (this.zoomInBtn) {
                this.zoomInBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.adjustZoom(1.2);
                });
            }
            if (this.zoomOutBtn) {
                this.zoomOutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.adjustZoom(0.8);
                });
            }
            
            // Annotation controls
            if (this.addAnnotationBtn) {
                this.addAnnotationBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.addAnnotation();
                });
            }
            if (this.clearAnnotationsBtn) {
                this.clearAnnotationsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.clearAnnotations();
                });
            }
            if (this.customColorPicker) {
                this.customColorPicker.addEventListener('change', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectedColor = e.target.value;
                });
            }
            if (this.opacitySlider) {
                this.opacitySlider.addEventListener('input', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.updateOpacity(e.target.value);
                });
            }
            if (this.borderWidthSlider) {
                this.borderWidthSlider.addEventListener('input', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.updateBorderWidth(e.target.value);
                });
            }
            
            // Color palette
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const color = e.target.dataset.color;
                    if (color) this.selectColor(color);
                });
            });
            
            // Scroll controls for effective scrolling
            if (this.scrollUpBtn) {
                this.scrollUpBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.scrollCanvas(-200);
                });
            }
            if (this.scrollDownBtn) {
                this.scrollDownBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.scrollCanvas(200);
                });
            }
            
            // Canvas events with proper scroll offset handling
            if (this.canvas) {
                this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
                this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
                this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
                this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
            }
            
            // Canvas container scroll events
            if (this.canvasContainer) {
                this.canvasContainer.addEventListener('scroll', (e) => this.updateScrollInfo());
            }
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }
    
    setupCanvas() {
        try {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        } catch (error) {
            console.error('Error setting up canvas:', error);
        }
    }
    
    resizeCanvas() {
        try {
            if (!this.canvas || !this.canvasContainer) return;
            
            const rect = this.canvasContainer.getBoundingClientRect();
            this.canvas.width = Math.max(rect.width - 20, 800);
            
            // Calculate height needed for multi-row display with proper scrolling
            if (this.sequences.length > 0) {
                const totalRows = Math.ceil(this.alignmentLength / this.lineLength);
                const seqRowHeight = (this.sequences.length * (this.cellHeight * this.zoom + 2)) + 35;
                const neededHeight = totalRows * seqRowHeight + 100;
                this.canvas.height = Math.max(neededHeight, 600);
                console.log(`Canvas resized to: ${this.canvas.width} x ${this.canvas.height}, Total rows: ${totalRows}, Sequences: ${this.sequences.length}`);
            } else {
                this.canvas.height = 600;
            }
            
            if (this.sequences.length > 0) {
                this.render();
            }
        } catch (error) {
            console.error('Error resizing canvas:', error);
        }
    }
    
    scrollCanvas(deltaY) {
        try {
            if (this.canvasContainer) {
                const newScrollTop = this.canvasContainer.scrollTop + deltaY;
                const maxScroll = this.canvasContainer.scrollHeight - this.canvasContainer.clientHeight;
                this.canvasContainer.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
                this.updateScrollInfo();
            }
        } catch (error) {
            console.error('Error scrolling canvas:', error);
        }
    }
    
    updateScrollInfo() {
        try {
            if (this.canvasContainer && this.scrollInfo) {
                const scrollTop = this.canvasContainer.scrollTop;
                const scrollHeight = this.canvasContainer.scrollHeight;
                const clientHeight = this.canvasContainer.clientHeight;
                const scrollPercent = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) || 0;
                this.safeSetTextContent(this.scrollInfo, `Scroll: ${scrollPercent}%`);
            }
        } catch (error) {
            console.error('Error updating scroll info:', error);
        }
    }
    
    // File handling - only FASTA now
    handleDragOver(e) {
        try {
            e.preventDefault();
            this.safeAddClass(this.uploadArea, 'drag-over');
        } catch (error) {
            console.error('Error handling drag over:', error);
        }
    }
    
    handleDragLeave(e) {
        try {
            e.preventDefault();
            this.safeRemoveClass(this.uploadArea, 'drag-over');
        } catch (error) {
            console.error('Error handling drag leave:', error);
        }
    }
    
    handleFileDrop(e) {
        try {
            e.preventDefault();
            this.safeRemoveClass(this.uploadArea, 'drag-over');
            const files = e.dataTransfer ? e.dataTransfer.files : null;
            if (files && files.length > 0) {
                this.processFile(files[0]);
            }
        } catch (error) {
            console.error('Error handling file drop:', error);
            this.showError('Error handling file drop: ' + error.message);
        }
    }
    
    handleFileSelect(e) {
        try {
            const file = e.target && e.target.files ? e.target.files[0] : null;
            if (file) {
                this.processFile(file);
            }
        } catch (error) {
            console.error('Error handling file select:', error);
            this.showError('Error handling file selection: ' + error.message);
        }
    }
    
    processFile(file) {
        setTimeout(async () => {
            this.showLoading(true);
            
            try {
                if (!file) {
                    throw new Error('No file provided');
                }
                
                const text = await this.readFile(file);
                if (!text || typeof text !== 'string') {
                    throw new Error('Failed to read file content');
                }
                
                const sequences = this.parseAlignment(text, file.name);
                
                if (!sequences || sequences.length === 0) {
                    throw new Error('No sequences found in file');
                }
                
                this.sequences = sequences;
                this.alignmentLength = sequences[0].sequence.length;
                this.currentRowStart = 0;
                this.annotations = [];
                
                this.updateFileInfo(file.name, sequences.length, this.alignmentLength);
                this.showMSAViewer();
                
                setTimeout(() => {
                    this.resizeCanvas();
                    this.render();
                    this.updateScrollInfo();
                }, 100);
                
                // Enable download buttons
                if (this.downloadImageBtn) this.downloadImageBtn.disabled = false;
                if (this.downloadAnnotationsBtn) this.downloadAnnotationsBtn.disabled = false;
                
            } catch (error) {
                console.error('Error processing file:', error);
                this.showError(`Error processing file: ${error.message}`);
            } finally {
                this.showLoading(false);
            }
        }, 10);
    }
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        resolve(e.target.result);
                    } catch (err) {
                        reject(new Error('Error reading file result'));
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            } catch (error) {
                reject(new Error('Failed to create file reader'));
            }
        });
    }
    
    parseAlignment(text, filename) {
        try {
            if (!text || !filename) {
                throw new Error('Invalid file content or filename');
            }
            
            const extension = filename.split('.').pop().toLowerCase();
            
            if (extension === 'fasta' || extension === 'fas' || text.includes('>')) {
                return this.parseFASTA(text);
            }
            
            throw new Error('Unsupported file format. Only FASTA files are supported.');
        } catch (error) {
            console.error('Error parsing alignment:', error);
            throw error;
        }
    }
    
    parseFASTA(text) {
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
            this.alignSequences(sequences);
            
            return sequences;
        } catch (error) {
            throw new Error('Error parsing FASTA format: ' + error.message);
        }
    }
    
    alignSequences(sequences) {
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
            
            console.log(`Aligned ${sequences.length} sequences to length ${maxLength}`);
        } catch (error) {
            throw error;
        }
    }
    
    updateFileInfo(filename, seqCount, alignmentLength) {
        try {
            const totalRows = Math.ceil(alignmentLength / this.lineLength);
            const fileInfoHTML = `
                <p><strong>File:</strong> ${filename}</p>
                <p><strong>Sequences:</strong> ${seqCount}</p>
                <p><strong>Length:</strong> ${alignmentLength}</p>
                <p><strong>Rows:</strong> ${totalRows}</p>
            `;
            this.safeSetInnerHTML(this.fileInfo, fileInfoHTML);
            
            this.safeSetTextContent(this.sequenceCount, `${seqCount} sequences`);
            this.safeSetTextContent(this.alignmentLengthElement, `${alignmentLength} positions`);
            
            this.updateViewInfo();
        } catch (error) {
            console.error('Error updating file info:', error);
        }
    }
    
    updateViewInfo() {
        try {
            const totalRows = Math.ceil(this.alignmentLength / this.lineLength);
            this.safeSetTextContent(this.currentView, `Multi-row view (${totalRows} rows)`);
            this.safeSetTextContent(this.scrollInfo, `Scrollable View`);
        } catch (error) {
            console.error('Error updating view info:', error);
        }
    }
    
    showMSAViewer() {
        try {
            this.safeAddClass(this.uploadArea, 'hidden');
            this.safeRemoveClass(this.msaViewer, 'hidden');
        } catch (error) {
            console.error('Error showing MSA viewer:', error);
        }
    }
    
    showLoading(show) {
        try {
            if (show) {
                this.safeRemoveClass(this.loadingOverlay, 'hidden');
            } else {
                this.safeAddClass(this.loadingOverlay, 'hidden');
            }
        } catch (error) {
            console.error('Error toggling loading overlay:', error);
        }
    }
    
    // Multi-row rendering
    render() {
        try {
            if (!this.ctx || this.sequences.length === 0) return;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderMultiRowAlignment();
            this.renderAnnotations();
            this.renderSelection();
        } catch (error) {
            console.error('Error rendering:', error);
        }
    }
    
    renderMultiRowAlignment() {
        try {
            if (!this.ctx) return;
            
            const totalRows = Math.ceil(this.alignmentLength / this.lineLength);
            let yOffset = 20;
            
            for (let row = 0; row < totalRows; row++) {
                const startPos = row * this.lineLength;
                const endPos = Math.min(startPos + this.lineLength, this.alignmentLength);
                
                // Render position numbers for this row
                this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary') || '#666666';
                this.ctx.font = '10px monospace';
                this.ctx.fillText(`${startPos + 1}-${endPos}`, 5, yOffset);
                
                yOffset += 15;
                
                // Render sequences for this row
                for (let i = 0; i < this.sequences.length; i++) {
                    // Sequence name
                    this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text') || '#000000';
                    this.ctx.font = '12px monospace';
                    const name = this.sequences[i].name || 'Unnamed';
                    const truncated = name.length > 20 ? name.substring(0, 17) + '...' : name;
                    this.ctx.fillText(truncated, 5, yOffset + 15);
                    
                    // Sequence characters
                    for (let j = startPos; j < endPos; j++) {
                        const residue = this.sequences[i].sequence[j] || '-';
                        const x = this.sequenceNameWidth + (j - startPos) * this.cellWidth * this.zoom;
                        const y = yOffset;
                        
                        // Background color based on color scheme
                        if (this.colorScheme !== 'none') {
                            const bgColor = this.getResidueColor(residue);
                            if (bgColor) {
                                this.ctx.fillStyle = bgColor;
                                this.ctx.fillRect(x, y, this.cellWidth * this.zoom, this.cellHeight * this.zoom);
                            }
                        }
                        
                        // Text
                        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text') || '#000000';
                        this.ctx.font = `${12 * this.zoom}px monospace`;
                        this.ctx.fillText(residue, x + 2, y + 14 * this.zoom);
                    }
                    
                    yOffset += this.cellHeight * this.zoom + 2;
                }
                
                yOffset += 20; // Space between row blocks
            }
        } catch (error) {
            console.error('Error rendering multi-row alignment:', error);
        }
    }
    
    getResidueColor(residue) {
        try {
            if (this.colorScheme === 'nucleotides') {
                return this.colorSchemes.nucleotides[residue] || '#FFFFFF';
            } else if (this.colorScheme === 'aminoAcids') {
                const scheme = this.colorSchemes.aminoAcids;
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
    }
    
    renderAnnotations() {
        try {
            if (!this.ctx) return;
            
            for (let annotation of this.annotations) {
                if (annotation.mode === 'border') {
                    // Render border-only annotation
                    this.ctx.strokeStyle = annotation.color;
                    this.ctx.lineWidth = annotation.borderWidth || 2;
                    this.ctx.setLineDash([]);
                    
                    const coords = this.getAnnotationCoordinates(annotation);
                    if (coords) {
                        this.ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);
                    }
                } else {
                    // Render filled annotation
                    this.ctx.fillStyle = this.hexToRgba(annotation.color, annotation.opacity);
                    
                    const coords = this.getAnnotationCoordinates(annotation);
                    if (coords) {
                        this.ctx.fillRect(coords.x, coords.y, coords.width, coords.height);
                    }
                }
            }
        } catch (error) {
            console.error('Error rendering annotations:', error);
        }
    }
    
    getAnnotationCoordinates(annotation) {
        try {
            const rowIndex = Math.floor(annotation.startPos / this.lineLength);
            const seqRowHeight = (this.sequences.length * (this.cellHeight * this.zoom + 2)) + 35;
            const baseY = 20 + rowIndex * seqRowHeight + 15;
            
            if (annotation.type === 'residue') {
                const posInRow = annotation.position % this.lineLength;
                const x = this.sequenceNameWidth + posInRow * this.cellWidth * this.zoom;
                const y = baseY + annotation.sequence * (this.cellHeight * this.zoom + 2);
                return {
                    x: x,
                    y: y,
                    width: this.cellWidth * this.zoom,
                    height: this.cellHeight * this.zoom
                };
            } else if (annotation.type === 'region') {
                const startPosInRow = annotation.startPos % this.lineLength;
                const x = this.sequenceNameWidth + startPosInRow * this.cellWidth * this.zoom;
                const y = baseY + annotation.startSeq * (this.cellHeight * this.zoom + 2);
                const width = (annotation.endPos - annotation.startPos + 1) * this.cellWidth * this.zoom;
                const height = (annotation.endSeq - annotation.startSeq + 1) * (this.cellHeight * this.zoom + 2);
                return { x, y, width, height };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting annotation coordinates:', error);
            return null;
        }
    }
    
    renderSelection() {
        try {
            if (!this.currentSelection || !this.ctx) return;
            
            this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#4ECDC4';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(
                this.currentSelection.x,
                this.currentSelection.y,
                this.currentSelection.width,
                this.currentSelection.height
            );
            this.ctx.setLineDash([]);
        } catch (error) {
            console.error('Error rendering selection:', error);
        }
    }
    
    // Event handlers
    handleMouseDown(e) {
        try {
            if (!this.canvas || !this.canvasContainer) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top + this.canvasContainer.scrollTop;
            
            this.mouseDown = true;
            this.startX = x;
            this.startY = y;
            
            this.updateCursorPosition(x, y);
        } catch (error) {
            console.error('Error handling mouse down:', error);
        }
    }
    
    handleMouseMove(e) {
        try {
            if (!this.canvas || !this.canvasContainer) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top + this.canvasContainer.scrollTop;
            
            this.updateCursorPosition(x, y);
            
            if (this.mouseDown) {
                this.updateSelection(this.startX, this.startY, x, y);
                this.render();
            }
        } catch (error) {
            console.error('Error handling mouse move:', error);
        }
    }
    
    handleMouseUp(e) {
        try {
            this.mouseDown = false;
            
            if (this.currentSelection) {
                this.updateSelectionInfo();
            }
        } catch (error) {
            console.error('Error handling mouse up:', error);
        }
    }
    
    updateCursorPosition(x, y) {
        try {
            const pos = this.getPositionFromCoords(x, y);
            if (pos.position >= 0 && pos.sequence >= 0) {
                this.safeSetTextContent(this.cursorPosition, `Position: ${pos.position + 1}, Seq: ${pos.sequence + 1}`);
            }
        } catch (error) {
            console.error('Error updating cursor position:', error);
        }
    }
    
    updateSelection(startX, startY, endX, endY) {
        try {
            const minX = Math.min(startX, endX);
            const maxX = Math.max(startX, endX);
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);
            
            this.currentSelection = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        } catch (error) {
            console.error('Error updating selection:', error);
        }
    }
    
    updateSelectionInfo() {
        try {
            if (!this.currentSelection) {
                this.safeSetTextContent(this.selectionInfo, 'No selection');
                return;
            }
            
            const startPos = this.getPositionFromCoords(this.currentSelection.x, this.currentSelection.y);
            const endPos = this.getPositionFromCoords(
                this.currentSelection.x + this.currentSelection.width,
                this.currentSelection.y + this.currentSelection.height
            );
            
            this.safeSetTextContent(this.selectionInfo, `Selected: Pos ${startPos.position + 1}-${endPos.position + 1}, Seq ${startPos.sequence + 1}-${endPos.sequence + 1}`);
        } catch (error) {
            console.error('Error updating selection info:', error);
        }
    }
    
    getPositionFromCoords(x, y) {
        try {
            // Calculate which row block we're in
            const seqRowHeight = (this.sequences.length * (this.cellHeight * this.zoom + 2)) + 35;
            const rowBlock = Math.floor((y - 20) / seqRowHeight);
            const yInBlock = (y - 20) % seqRowHeight - 15;
            
            // Calculate position within the row
            const posInRow = Math.floor((x - this.sequenceNameWidth) / (this.cellWidth * this.zoom));
            const position = Math.max(0, Math.min(rowBlock * this.lineLength + posInRow, this.alignmentLength - 1));
            
            // Calculate sequence index
            const sequence = Math.max(0, Math.min(Math.floor(yInBlock / (this.cellHeight * this.zoom + 2)), this.sequences.length - 1));
            
            return { position, sequence };
        } catch (error) {
            console.error('Error getting position from coords:', error);
            return { position: 0, sequence: 0 };
        }
    }
    
    handleWheel(e) {
        try {
            if (e.ctrlKey) {
                e.preventDefault();
                // Zoom
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                this.adjustZoom(zoomFactor);
            }
        } catch (error) {
            console.error('Error handling wheel event:', error);
        }
    }
    
    handleKeyDown(e) {
        try {
            switch (e.key) {
                case '+':
                case '=':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.adjustZoom(1.2);
                    }
                    break;
                case '-':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.adjustZoom(0.8);
                    }
                    break;
                case 'ArrowUp':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.scrollCanvas(-50);
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.scrollCanvas(50);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling key down:', error);
        }
    }
    
    // Control methods
    changeColorScheme(scheme) {
        try {
            this.colorScheme = scheme;
            this.render();
        } catch (error) {
            console.error('Error changing color scheme:', error);
        }
    }
    
    changeLineLength(length) {
        try {
            this.lineLength = length;
            this.updateFileInfo('Current file', this.sequences.length, this.alignmentLength);
            this.resizeCanvas();
            this.render();
        } catch (error) {
            console.error('Error changing line length:', error);
        }
    }
    
    changeAnnotationMode(mode) {
        try {
            this.annotationMode = mode;
            
            // Show/hide appropriate controls
            if (mode === 'border') {
                if (this.opacityGroup) this.opacityGroup.style.display = 'none';
                if (this.borderWidthGroup) this.borderWidthGroup.style.display = 'block';
            } else {
                if (this.opacityGroup) this.opacityGroup.style.display = 'block';
                if (this.borderWidthGroup) this.borderWidthGroup.style.display = 'none';
            }
        } catch (error) {
            console.error('Error changing annotation mode:', error);
        }
    }
    
    adjustZoom(factor) {
        try {
            this.zoom = Math.max(0.5, Math.min(3.0, this.zoom * factor));
            this.safeSetTextContent(this.zoomLevel, Math.round(this.zoom * 100) + '%');
            this.resizeCanvas();
            this.render();
        } catch (error) {
            console.error('Error adjusting zoom:', error);
        }
    }
    
    selectColor(color) {
        try {
            if (!color) return;
            
            const activeElement = document.querySelector('.color-option.active');
            if (activeElement) {
                activeElement.classList.remove('active');
            }
            
            const colorElement = document.querySelector(`[data-color="${color}"]`);
            if (colorElement) {
                colorElement.classList.add('active');
            }
            
            this.selectedColor = color;
            if (this.customColorPicker) {
                this.customColorPicker.value = color;
            }
        } catch (error) {
            console.error('Error selecting color:', error);
        }
    }
    
    updateOpacity(value) {
        try {
            this.selectedOpacity = parseFloat(value) || 0.7;
            this.safeSetTextContent(this.opacityValue, Math.round(this.selectedOpacity * 100) + '%');
        } catch (error) {
            console.error('Error updating opacity:', error);
        }
    }
    
    updateBorderWidth(value) {
        try {
            this.selectedBorderWidth = parseInt(value) || 2;
            this.safeSetTextContent(this.borderWidthValue, this.selectedBorderWidth + 'px');
        } catch (error) {
            console.error('Error updating border width:', error);
        }
    }
    
    // Annotation methods
    addAnnotation() {
        try {
            if (!this.currentSelection) {
                this.showError('Please make a selection first');
                return;
            }
            
            const startPos = this.getPositionFromCoords(this.currentSelection.x, this.currentSelection.y);
            const endPos = this.getPositionFromCoords(
                this.currentSelection.x + this.currentSelection.width,
                this.currentSelection.y + this.currentSelection.height
            );
            
            const annotation = {
                id: Date.now(),
                type: this.selectionMode,
                mode: this.annotationMode,
                color: this.selectedColor,
                opacity: this.selectedOpacity,
                borderWidth: this.selectedBorderWidth,
                startPos: startPos.position,
                endPos: endPos.position,
                startSeq: startPos.sequence,
                endSeq: endPos.sequence
            };
            
            if (this.selectionMode === 'residue') {
                annotation.position = startPos.position;
                annotation.sequence = startPos.sequence;
            }
            
            this.annotations.push(annotation);
            this.updateAnnotationsList();
            this.currentSelection = null;
            this.render();
        } catch (error) {
            console.error('Error adding annotation:', error);
            this.showError('Error adding annotation: ' + error.message);
        }
    }
    
    updateAnnotationsList() {
        try {
            if (this.annotations.length === 0) {
                this.safeSetInnerHTML(this.annotationsList, '<p class="text-secondary">No annotations</p>');
                return;
            }
            
            let html = '';
            for (let annotation of this.annotations) {
                const colorDisplay = annotation.mode === 'border' 
                    ? `<div class="annotation-border" style="border-color: ${annotation.color}; border-width: ${annotation.borderWidth || 2}px;"></div>`
                    : `<div class="annotation-color" style="background-color: ${annotation.color}"></div>`;
                
                html += `
                    <div class="annotation-item">
                        ${colorDisplay}
                        <div class="annotation-info">
                            <p class="annotation-label">${annotation.type} (${annotation.mode})</p>
                            <p class="annotation-details">${this.getAnnotationDetails(annotation)}</p>
                        </div>
                        <button class="annotation-remove" onclick="msaAnnotator.removeAnnotation(${annotation.id})">×</button>
                    </div>
                `;
            }
            this.safeSetInnerHTML(this.annotationsList, html);
        } catch (error) {
            console.error('Error updating annotations list:', error);
        }
    }
    
    getAnnotationDetails(annotation) {
        try {
            if (annotation.type === 'residue') {
                return `Pos ${annotation.position + 1}, Seq ${annotation.sequence + 1}`;
            } else {
                return `Pos ${annotation.startPos + 1}-${annotation.endPos + 1}, Seq ${annotation.startSeq + 1}-${annotation.endSeq + 1}`;
            }
        } catch (error) {
            console.error('Error getting annotation details:', error);
            return 'Unknown';
        }
    }
    
    removeAnnotation(id) {
        try {
            this.annotations = this.annotations.filter(a => a.id !== id);
            this.updateAnnotationsList();
            this.render();
        } catch (error) {
            console.error('Error removing annotation:', error);
        }
    }
    
    clearAnnotations() {
        try {
            if (confirm('Clear all annotations?')) {
                this.annotations = [];
                this.updateAnnotationsList();
                this.render();
            }
        } catch (error) {
            console.error('Error clearing annotations:', error);
        }
    }
    
    // Export methods
    downloadImage() {
        try {
            if (!this.ctx || this.sequences.length === 0) {
                this.showError('No data to export');
                return;
            }
            
            const link = document.createElement('a');
            link.download = 'msa_annotated_multirow.png';
            link.href = this.canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Error downloading image:', error);
            this.showError('Error downloading image: ' + error.message);
        }
    }
    
    downloadAnnotations() {
        try {
            const data = {
                filename: 'annotations.json',
                sequences: this.sequences.map(s => ({ name: s.name, length: s.sequence.length })),
                annotations: this.annotations,
                lineLength: this.lineLength,
                created: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.download = 'msa_annotations.json';
            link.href = URL.createObjectURL(blob);
            link.click();
        } catch (error) {
            console.error('Error downloading annotations:', error);
            this.showError('Error downloading annotations: ' + error.message);
        }
    }
    
    // Load sample data - Fixed implementation
    loadSampleData() {
        try {
            console.log('Loading sample data...');
            const blob = new Blob([this.sampleMSAFasta], { type: 'text/plain' });
            const file = new File([blob], 'sample.fasta', { type: 'text/plain' });
            
            this.processFile(file);
        } catch (error) {
            console.error('Error loading sample data:', error);
            this.showError('Error loading sample data: ' + error.message);
        }
    }
    
    // Utility methods
    hexToRgba(hex, alpha) {
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
    }
}

// Initialize the application
let msaAnnotator;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        msaAnnotator = new MSAAnnotator();
        
        // Add sample data button for testing
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            const sampleBtn = document.createElement('button');
            sampleBtn.className = 'btn btn--outline';
            sampleBtn.textContent = 'Load Sample';
            sampleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Load Sample button clicked');
                try {
                    msaAnnotator.loadSampleData();
                } catch (error) {
                    console.error('Error loading sample data:', error);
                    alert('Error loading sample data: ' + error.message);
                }
            });
            headerControls.insertBefore(sampleBtn, headerControls.firstChild);
        }
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
});