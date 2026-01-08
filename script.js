// URFlix Report Maker - Professional Backend with Gemini AI

// Configure PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

class ReportMaker {
    constructor() {
        this.originalReport = '';
        this.currentReport = '';
        this.originalFile = null; // Store original file
        this.originalFileType = null; // Store original file type: 'pdf', 'word', 'text'
        this.originalFileName = ''; // Store original file name
        // Google Gemini API Key - automatically configured
        this.apiKey = 'AIzaSyDNS6TnK9aaDFr71EZZc7xIv0eO0YMcrrw';
        this.isProcessing = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const reportText = document.getElementById('reportText');
        const loadReportBtn = document.getElementById('loadReportBtn');
        const applyPromptBtn = document.getElementById('applyPromptBtn');
        const resetBtn = document.getElementById('resetBtn');
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        const copyBtn = document.getElementById('copyBtn');

        // Upload area click
        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // Load report from textarea
        loadReportBtn.addEventListener('click', () => {
            const text = reportText.value.trim();
            if (text) {
                this.loadReport(text);
            } else {
                this.showNotification('Please enter report text', 'error');
            }
        });

        // Apply prompt
        applyPromptBtn.addEventListener('click', async () => {
            const prompt = document.getElementById('promptInput').value.trim();
            if (!this.currentReport) {
                this.showNotification('Please load a report first', 'error');
                return;
            }
            if (!prompt) {
                this.showNotification('Please enter a modification prompt', 'error');
                return;
            }
            await this.applyPromptWithAI(prompt);
        });

        // Reset to original
        resetBtn.addEventListener('click', () => {
            if (this.originalReport) {
                this.currentReport = this.originalReport;
                this.displayReport();
                this.showNotification('Report reset to original', 'success');
            }
        });

        // Download report in original format
        downloadPdfBtn.addEventListener('click', () => {
            this.downloadReportInOriginalFormat();
        });

        // Copy to clipboard
        copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });
    }

    async handleFile(file) {
        const fileName = file.name.toLowerCase();
        const fileInfo = document.getElementById('fileInfo');
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `<p>Processing: ${file.name}...</p>`;

        try {
            // Store original file information
            this.originalFile = file;
            this.originalFileName = file.name;

            if (fileName.endsWith('.txt')) {
                this.originalFileType = 'text';
                const text = await file.text();
                this.loadReport(text, 'text');
                fileInfo.innerHTML = `<p class="success">✓ Loaded: ${file.name}</p>`;
            } else if (fileName.endsWith('.pdf')) {
                this.originalFileType = 'pdf';
                await this.parsePDF(file);
                fileInfo.innerHTML = `<p class="success">✓ Loaded: ${file.name}</p>`;
            } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
                this.originalFileType = 'word';
                await this.parseWord(file);
                fileInfo.innerHTML = `<p class="success">✓ Loaded: ${file.name}</p>`;
            } else {
                this.showNotification('Unsupported file type. Please use PDF, Word, or Text files.', 'error');
                fileInfo.style.display = 'none';
            }
        } catch (error) {
            console.error('Error processing file:', error);
            this.showNotification(`Error processing file: ${error.message}`, 'error');
            fileInfo.style.display = 'none';
        }
    }

    async parsePDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            // Store original PDF data for later reconstruction
            this.originalFileData = arrayBuffer;
            
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            this.pdfPages = []; // Store page data for reconstruction

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
                
                // Store page structure for reconstruction
                this.pdfPages.push({
                    pageNumber: i,
                    textItems: textContent.items,
                    viewport: page.getViewport({ scale: 1 })
                });
            }

            this.loadReport(fullText.trim(), 'pdf');
        } catch (error) {
            throw new Error('Failed to parse PDF: ' + error.message);
        }
    }

    async parseWord(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            // Store original Word document data
            this.originalFileData = arrayBuffer;
            
            const result = await mammoth.extractRawText({ arrayBuffer });
            // Also extract HTML to preserve formatting
            const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
            this.wordHtml = htmlResult.value;
            
            this.loadReport(result.value, 'word');
        } catch (error) {
            throw new Error('Failed to parse Word document: ' + error.message);
        }
    }

    loadReport(text, fileType = 'text') {
        this.originalReport = text;
        this.currentReport = text;
        if (!this.originalFileType) {
            this.originalFileType = fileType;
        }
        this.displayReport();
        this.showNotification('Report loaded successfully!', 'success');
        
        // Clear the textarea
        document.getElementById('reportText').value = '';
    }

    displayReport() {
        const reportDisplay = document.getElementById('reportDisplay');
        
        if (!this.currentReport) {
            reportDisplay.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p>No report loaded. Upload or paste a demo report to get started.</p>
                </div>
            `;
            return;
        }

        // Format the report with basic HTML formatting
        const formattedReport = this.formatReport(this.currentReport);
        reportDisplay.innerHTML = `<div class="report-content">${formattedReport}</div>`;
    }

    formatReport(text) {
        // Basic formatting: preserve line breaks and add some structure
        return text
            .replace(/\n\n+/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(#{1,3})\s(.+)$/gm, (match, hashes, text) => {
                const level = hashes.length;
                return `<h${level}>${text}</h${level}>`;
            })
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>');
    }

    async applyPromptWithAI(prompt, retryCount = 0) {
        if (this.isProcessing && retryCount === 0) {
            this.showNotification('Please wait for the current operation to complete', 'warning');
            return;
        }

        if (retryCount === 0) {
            this.isProcessing = true;
        }
        
        const applyBtn = document.getElementById('applyPromptBtn');
        const btnText = applyBtn.querySelector('.btn-text');
        const btnLoader = applyBtn.querySelector('.btn-loader');
        const aiStatus = document.getElementById('aiStatus');

        // Show loading state
        if (retryCount === 0) {
            applyBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
        }
        
        aiStatus.style.display = 'block';
        
        if (retryCount > 0) {
            const delay = 2000 * Math.pow(2, retryCount - 1);
            aiStatus.innerHTML = `<p class="processing">🔄 Model overloaded. Retrying in ${Math.ceil(delay/1000)}s... (Attempt ${retryCount + 1}/5)</p>`;
        } else {
            aiStatus.innerHTML = '<p class="processing">🤖 Processing with Gemini AI...</p>';
        }

        try {
            const modifiedReport = await this.callGeminiAPI(this.currentReport, prompt, retryCount);
            this.currentReport = modifiedReport;
            this.displayReport();
            this.showNotification('Report modified successfully with AI!', 'success');
            aiStatus.innerHTML = '<p class="success">✓ AI processing completed</p>';
            this.isProcessing = false;
            applyBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            setTimeout(() => {
                aiStatus.style.display = 'none';
            }, 5000);
        } catch (error) {
            console.error('Gemini API Error:', error);
            
            // If overloaded and retries left, retry
            if ((error.message.includes('overloaded') || error.message.includes('overload')) && retryCount < 5) {
                const delay = 2000 * Math.pow(2, retryCount);
                await this.sleep(delay);
                return this.applyPromptWithAI(prompt, retryCount + 1);
            }
            
            this.showNotification(`AI Error: ${error.message}`, 'error');
            aiStatus.innerHTML = `<p class="error">✗ Error: ${error.message}</p>`;
            this.isProcessing = false;
            applyBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            setTimeout(() => {
                aiStatus.style.display = 'none';
            }, 5000);
        }
    }

    async callGeminiAPI(report, prompt, retryCount = 0) {
        const maxRetries = 5;
        const baseDelay = 2000; // 2 seconds base delay
        
        // Try to get available models first
        let modelsToTry = [];
        try {
            modelsToTry = await this.getAvailableModels();
        } catch (error) {
            console.warn('Could not fetch available models, using defaults');
            // Use most common working models
            modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
        }

        const fullPrompt = `You are a professional report editor. Modify the following report according to the user's instructions while maintaining the original structure, formatting, and professional tone.

Original Report:
${report}

User's Modification Request:
${prompt}

Return ONLY the modified report text, no explanations or additional text:`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: fullPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        };

        // Try each model with different API versions
        const apiVersions = ['v1', 'v1beta'];
        let lastError = null;

        for (const model of modelsToTry) {
            for (const apiVersion of apiVersions) {
                try {
                    const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${this.apiKey}`;
                    
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody)
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
                        lastError = new Error(errorMessage);
                        
                        // If model not found, try next combination
                        if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
                            continue;
                        }
                        
                        // For API key errors, throw immediately
                        if (errorMessage.includes('API key') || errorMessage.includes('API_KEY') || response.status === 401 || response.status === 403) {
                            throw new Error('Invalid API key or insufficient permissions. Please check your Gemini API key.');
                        }
                        
                        // For overloaded model, retry with exponential backoff
                        if (errorMessage.includes('overloaded') || errorMessage.includes('overload')) {
                            if (retryCount < maxRetries) {
                                const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
                                await this.sleep(delay);
                                return this.callGeminiAPI(report, prompt, retryCount + 1);
                            } else {
                                throw new Error('Model is overloaded. Please try again in a few moments.');
                            }
                        }
                        
                        // For quota errors, throw immediately
                        if (errorMessage.includes('quota') || response.status === 429) {
                            throw new Error('API quota exceeded. Please try again later.');
                        }
                        
                        throw new Error(errorMessage);
                    }

                    const data = await response.json();
                    
                    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                        const generatedText = data.candidates[0].content.parts[0].text;
                        return generatedText.trim();
                    } else {
                        throw new Error('Invalid response format from Gemini API');
                    }
                } catch (error) {
                    // If it's overloaded and we haven't exceeded retries, retry
                    if ((error.message.includes('overloaded') || error.message.includes('overload')) && retryCount < maxRetries) {
                        const delay = baseDelay * Math.pow(2, retryCount);
                        await this.sleep(delay);
                        return this.callGeminiAPI(report, prompt, retryCount + 1);
                    }
                    
                    // If it's a model not found error, try next combination
                    if (error.message.includes('not found') || error.message.includes('not supported')) {
                        lastError = error;
                        continue;
                    }
                    // For other errors, throw immediately
                    throw error;
                }
            }
        }
        
        // If all combinations failed
        if (lastError) {
            throw new Error(`Unable to connect to Gemini API. ${lastError.message}. Please ensure your API key is valid and Generative Language API is enabled.`);
        }
        
        throw new Error('No available models found. Please check your API key configuration.');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getAvailableModels() {
        try {
            // Try to list available models using v1 API
            const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${this.apiKey}`;
            const response = await fetch(listUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.models && Array.isArray(data.models)) {
                    // Filter models that support generateContent
                    const supportedModels = data.models
                        .filter(model => {
                            const methods = model.supportedGenerationMethods || [];
                            return methods.includes('generateContent');
                        })
                        .map(model => {
                            // Extract model name (remove 'models/' prefix if present)
                            const name = model.name || '';
                            return name.replace(/^models\//, '');
                        })
                        .filter(name => name && name.startsWith('gemini'));
                    
                    if (supportedModels.length > 0) {
                        return supportedModels;
                    }
                }
            }
        } catch (error) {
            console.warn('Could not fetch model list:', error);
        }
        
        // Return default models if listing fails
        return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    }

    downloadReport() {
        if (!this.currentReport) {
            this.showNotification('No report to download', 'error');
            return;
        }

        const blob = new Blob([this.currentReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `URFlix_Report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report downloaded successfully!', 'success');
    }

    async downloadReportInOriginalFormat() {
        if (!this.currentReport) {
            this.showNotification('No report to download', 'error');
            return;
        }

        // Download in the same format as uploaded
        if (this.originalFileType === 'pdf') {
            await this.downloadAsPDF();
        } else if (this.originalFileType === 'word') {
            await this.downloadAsWord();
        } else {
            // Default to PDF for text files
            await this.downloadAsPDF();
        }
    }

    async downloadAsPDF() {
        if (!this.currentReport) {
            this.showNotification('No report to download', 'error');
            return;
        }

        try {
            this.showNotification('Generating PDF with modified content...', 'success');
            
            if (typeof window.jspdf === 'undefined') {
                this.showNotification('PDF library not loaded. Please refresh the page.', 'error');
                return;
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Parse the modified report and recreate PDF structure
            const lines = this.currentReport.split('\n');
            const pageWidth = 190; // A4 width - margins (mm)
            const pageHeight = 277; // A4 height - margins (mm)
            let y = 20;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Check if we need a new page
                if (y > pageHeight) {
                    pdf.addPage();
                    y = 20;
                }

                if (line.length === 0) {
                    y += 5; // Empty line spacing
                    continue;
                }

                // Detect headings
                if (line.startsWith('#')) {
                    const level = line.match(/^#+/)[0].length;
                    const text = line.replace(/^#+\s*/, '');
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(14 - level);
                    pdf.text(text, 10, y);
                    y += 8 + level;
                } else if (line.match(/^[A-Z][A-Z\s]{3,}$/)) {
                    // All caps = heading
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(13);
                    pdf.text(line, 10, y);
                    y += 8;
                } else {
                    // Regular text - wrap if needed
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    const wrappedLines = pdf.splitTextToSize(line, pageWidth);
                    pdf.text(wrappedLines, 10, y);
                    y += wrappedLines.length * 5.5;
                }
            }

            // Generate filename based on original
            const baseName = this.originalFileName.replace(/\.[^/.]+$/, '') || 'URFlix_Report';
            const dateStr = new Date().toISOString().split('T')[0];
            pdf.save(`${baseName}_Modified_${dateStr}.pdf`);
            this.showNotification('PDF downloaded successfully with modified content!', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            this.showNotification('Error generating PDF: ' + error.message, 'error');
        }
    }

    async downloadAsWord() {
        if (!this.currentReport) {
            this.showNotification('No report to download', 'error');
            return;
        }

        try {
            this.showNotification('Generating Word document with modified content...', 'success');

            if (typeof docx === 'undefined') {
                this.showNotification('Word library not loaded. Downloading as text file.', 'warning');
                this.downloadReport();
                return;
            }

            const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
            
            // Parse the modified report
            const paragraphs = this.currentReport.split('\n').filter(p => p.trim().length > 0);
            const docChildren = [];

            for (let i = 0; i < paragraphs.length; i++) {
                const line = paragraphs[i].trim();
                
                if (line.length === 0) {
                    docChildren.push(new Paragraph({ text: '' }));
                    continue;
                }

                // Detect headings
                if (line.startsWith('#')) {
                    const level = line.match(/^#+/)[0].length;
                    const text = line.replace(/^#+\s*/, '');
                    const headingLevel = level === 1 ? HeadingLevel.HEADING_1 :
                                       level === 2 ? HeadingLevel.HEADING_2 :
                                       HeadingLevel.HEADING_3;
                    docChildren.push(new Paragraph({
                        text: text,
                        heading: headingLevel
                    }));
                } else if (line.match(/^[A-Z][A-Z\s]{3,}$/)) {
                    // All caps = heading
                    docChildren.push(new Paragraph({
                        text: line,
                        heading: HeadingLevel.HEADING_2
                    }));
                } else {
                    // Regular paragraph
                    docChildren.push(new Paragraph({
                        children: [new TextRun(line)]
                    }));
                }
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: docChildren
                }]
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Generate filename based on original
            const baseName = this.originalFileName.replace(/\.[^/.]+$/, '') || 'URFlix_Report';
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `${baseName}_Modified_${dateStr}.docx`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Word document downloaded successfully with modified content!', 'success');
        } catch (error) {
            console.error('Word document generation error:', error);
            this.showNotification('Error generating Word document: ' + error.message, 'error');
        }
    }

    async downloadReportAsEditablePDF() {
        if (!this.currentReport) {
            this.showNotification('No report to download', 'error');
            return;
        }

        try {
            this.showNotification('Generating editable PDF...', 'success');
            
            if (typeof window.jspdf === 'undefined') {
                this.showNotification('PDF library not loaded. Please refresh the page.', 'error');
                return;
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Parse the report text to identify editable fields
            const lines = this.currentReport.split('\n');
            const pageWidth = 190; // A4 width - margins (mm)
            const pageHeight = 277; // A4 height - margins (mm)
            let y = 20;
            let fieldIndex = 0;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Check if we need a new page
                if (y > pageHeight) {
                    pdf.addPage();
                    y = 20;
                }

                // Detect potential editable fields (dates, numbers, names, etc.)
                const isEditableField = this.isEditableField(line);
                
                if (isEditableField) {
                    // Create a text field for editable content
                    const fieldName = `field_${fieldIndex++}`;
                    const fieldWidth = pageWidth;
                    const fieldHeight = 8;
                    
                    // Add label if it exists
                    const labelMatch = line.match(/^([^:]+):\s*(.+)$/);
                    if (labelMatch) {
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(10);
                        pdf.text(labelMatch[1] + ':', 10, y);
                        y += 5;
                        
                        // Create text field for the value
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(11);
                        pdf.textField(fieldName, {
                            x: 10,
                            y: y - 3,
                            width: fieldWidth,
                            height: fieldHeight,
                            value: labelMatch[2],
                            borderStyle: 'S',
                            borderColor: [99, 102, 241],
                            backgroundColor: [255, 255, 255],
                            textColor: [0, 0, 0],
                            fontSize: 11
                        });
                    } else {
                        // Create text field for the entire line
                        pdf.textField(fieldName, {
                            x: 10,
                            y: y - 3,
                            width: fieldWidth,
                            height: fieldHeight,
                            value: line,
                            borderStyle: 'S',
                            borderColor: [99, 102, 241],
                            backgroundColor: [255, 255, 255],
                            textColor: [0, 0, 0],
                            fontSize: 11
                        });
                    }
                    y += fieldHeight + 3;
                } else {
                    // Regular text (headings, paragraphs)
                    if (line.startsWith('#') || line.match(/^[A-Z][A-Z\s]+$/)) {
                        // Heading
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(14);
                        pdf.text(line.replace(/^#+\s*/, ''), 10, y);
                        y += 8;
                    } else if (line.length > 0) {
                        // Regular paragraph
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(11);
                        const wrappedLines = pdf.splitTextToSize(line, pageWidth);
                        pdf.text(wrappedLines, 10, y);
                        y += wrappedLines.length * 6;
                    } else {
                        // Empty line
                        y += 5;
                    }
                }
            }

            // Save PDF
            pdf.save(`URFlix_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            this.showNotification('Editable PDF downloaded successfully! You can edit the highlighted fields.', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            this.showNotification('Error generating PDF. Try downloading as Word document instead.', 'error');
        }
    }

    isEditableField(line) {
        // Detect patterns that should be editable fields
        const patterns = [
            /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, // Dates
            /\$\d+/, // Currency
            /^\d+%/, // Percentages
            /:\s*\d+/, // Numbers after colon
            /:\s*[A-Z][a-z]+/, // Names/words after colon
            /email/i,
            /phone/i,
            /address/i,
            /name/i,
            /date/i,
            /amount/i,
            /total/i,
            /revenue/i,
            /cost/i
        ];
        
        return patterns.some(pattern => pattern.test(line));
    }

    async downloadReportAsWord() {
        if (!this.currentReport) {
            this.showNotification('No report to download', 'error');
            return;
        }

        try {
            this.showNotification('Generating Word document...', 'success');

            // Parse report into paragraphs
            const paragraphs = this.currentReport.split('\n\n').filter(p => p.trim().length > 0);
            const docxContent = [];

            for (const para of paragraphs) {
                const lines = para.split('\n').filter(l => l.trim().length > 0);
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    
                    // Detect headings
                    if (trimmedLine.startsWith('#')) {
                        const level = trimmedLine.match(/^#+/)[0].length;
                        const text = trimmedLine.replace(/^#+\s*/, '');
                        docxContent.push({
                            text: text,
                            heading: `Heading${Math.min(level, 3)}`
                        });
                    } else if (trimmedLine.match(/^[A-Z][A-Z\s]{3,}$/)) {
                        // All caps line = heading
                        docxContent.push({
                            text: trimmedLine,
                            heading: 'Heading2'
                        });
                    } else {
                        // Regular paragraph
                        docxContent.push({
                            text: trimmedLine,
                            heading: null
                        });
                    }
                }
                docxContent.push({ text: '', heading: null }); // Add spacing
            }

            // Create Word document using docx library
            if (typeof docx !== 'undefined') {
                const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
                
                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: docxContent.map(item => {
                            if (item.heading) {
                                const level = item.heading === 'Heading1' ? HeadingLevel.HEADING_1 :
                                            item.heading === 'Heading2' ? HeadingLevel.HEADING_2 :
                                            HeadingLevel.HEADING_3;
                                return new Paragraph({
                                    text: item.text,
                                    heading: level
                                });
                            } else if (item.text === '') {
                                return new Paragraph({ text: '' });
                            } else {
                                return new Paragraph({
                                    children: [new TextRun(item.text)]
                                });
                            }
                        })
                    }]
                });

                const blob = await Packer.toBlob(doc);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `URFlix_Report_${new Date().toISOString().split('T')[0]}.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('Word document downloaded successfully! Fully editable in Microsoft Word.', 'success');
            } else {
                // Fallback: download as text file
                this.showNotification('Word library not loaded. Downloading as text file.', 'warning');
                this.downloadReport();
            }
        } catch (error) {
            console.error('Word document generation error:', error);
            this.showNotification('Error generating Word document. Try PDF instead.', 'error');
        }
    }

    async generatePDFFromText(text) {
        if (typeof window.jspdf === 'undefined') {
            this.showNotification('PDF library not loaded. Downloading as text file instead.', 'warning');
            this.downloadReport();
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Set font
            pdf.setFont('courier', 'normal');
            pdf.setFontSize(10);

            // Split text into lines
            const lines = pdf.splitTextToSize(text, 190); // 190mm width (A4 width - margins)
            
            const lineHeight = 6;
            const pageHeight = 287; // A4 height - margins
            let y = 20;
            let page = 1;

            for (let i = 0; i < lines.length; i++) {
                if (y > pageHeight) {
                    pdf.addPage();
                    page++;
                    y = 20;
                }
                pdf.text(lines[i], 10, y);
                y += lineHeight;
            }

            pdf.save(`URFlix_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            this.showNotification('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            this.showNotification('Error generating PDF. Downloading as text file instead.', 'error');
            this.downloadReport();
        }
    }

    async copyToClipboard() {
        if (!this.currentReport) {
            this.showNotification('No report to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.currentReport);
            this.showNotification('Report copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentReport;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Report copied to clipboard!', 'success');
        }
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.background = type === 'error' ? 'var(--error)' : 
                                        type === 'warning' ? 'var(--warning)' : 
                                        'var(--success)';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReportMaker();
});
