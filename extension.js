const vscode = require('vscode');
const { execSync, spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let statusBar;

function activate(context) {
    console.log('PowerBASIC extension activated');
    
    // Create status bar
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.command = 'powerbasic.showStatus';
    updateStatusBar('Ready');
    statusBar.show();
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('powerbasic.build', compileFile),
        vscode.commands.registerCommand('powerbasic.run', runFile),
        vscode.commands.registerCommand('powerbasic.buildAndRun', compileAndRun),
        vscode.commands.registerCommand('powerbasic.showStatus', showStatus),
        vscode.commands.registerCommand('pbforms.showDDTReference', showDDTReference),
        vscode.commands.registerCommand('pbforms.insertControlTemplate', insertControlTemplate),
        statusBar
    );

    // Register definition provider for Go to Definition
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('powerbasic', new PowerBASICDefinitionProvider())
    );

    // Register hover provider for variable type information
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('powerbasic', new PowerBASICHoverProvider())
    );

    // Verify PBWIN.exe is available on activation
    const isPbwinAvailable = checkPbwinAvailable();
    if (!isPbwinAvailable) {
        vscode.window.showWarningMessage('PowerBASIC: PBWIN.exe not found. Please configure powerbasic.pbwinPath in settings.');
    }
}

function checkPbwinAvailable() {
    const config = vscode.workspace.getConfiguration('powerbasic');
    const pbwinPath = config.get('pbwinPath') || 'C:\\PBWin10\\bin\\PBWin.exe';
    const useWineOnLinux = config.get('useWineOnLinux');
    const isLinux = process.platform === 'linux';
    
    // First check if file exists
    if (!fs.existsSync(pbwinPath)) {
        return false;
    }

    try {
        if (isLinux && useWineOnLinux) {
            execSync('which wine', { stdio: 'pipe' });
            return true;
        } else {
            return true;
        }
    } catch (error) {
        return false;
    }
}

function updateStatusBar(message) {
    if (statusBar) {
        statusBar.text = `$(tools) PB: ${message}`;
    }
}

function showStatus() {
    const isPbwinAvailable = checkPbwinAvailable();
    const status = isPbwinAvailable ? 'PBWIN.exe found' : 'PBWIN.exe NOT found';
    vscode.window.showInformationMessage(`PowerBASIC Status: ${status}`);
}

async function compileFile() {
    const folders = vscode.workspace.workspaceFolders;
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const filePath = document.uri.fsPath;
    const fileDir = path.dirname(filePath);
    let fileName = path.basename(filePath, path.extname(filePath));


    for (let index = 0; index < folders.length; index++) {
        console.log(`folder name: ${folders[index].uri.toString()}`);
        fs.readdirSync(folders[index].uri.fsPath).forEach(file => {
        // will also include directory names
        if(file.endsWith('.bas') && !file.startsWith('Backup')){
            console.log(`Found file: ${file}`);
            fileName = file;
        }
        });
        
    }

    vscode.workspace.saveAll();
    await new Promise(resolve => setTimeout(resolve, 500));

    updateStatusBar('Compiling...');

    try {
        if (!checkPbwinAvailable()) {
            throw new Error('PBWIN.exe not found. Please configure powerbasic.pbwinPath in settings.');
        }

        // Kill any running instances of the compiled exe to avoid file locking
        try {
            if (process.platform === 'win32') {
                // Try to kill gracefully first, then forcefully
                try {
                    execSync(`taskkill /IM ${fileName.replace('.bas','')}.exe /F`, { stdio: 'pipe' });
                } catch (e) {
                    console.log(`Failed to kill: ${e.message}`)
                }
            } else {
                execSync(`pkill -9 "${fileName}"`, { stdio: 'pipe' });
            }
            // Wait a moment for the process to fully terminate
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
            // Ignore if process doesn't exist
        }

        const config = vscode.workspace.getConfiguration('powerbasic');
        const pbwinPath = config.get('pbwinPath') || 'C:\\PBWin10\\bin\\PBWin.exe';
        const includeDir = config.get('includeDirectory') || 'C:\\PBWin10\\WinAPI\\';
        const useWineOnLinux = config.get('useWineOnLinux');
        const isLinux = process.platform === 'linux';

        let command;
        if (isLinux && useWineOnLinux) {
            command = `wine "${pbwinPath}" /Q /L /I.\\\\;"${includeDir}"\\  "${fileName}" `;
        } else {
            command = `"${pbwinPath}" /Q /L /I.\\\\;"${includeDir}"\\  "${fileName}" `;
        }
        console.log(command);
        const output = execSync(command, { encoding: 'utf-8', shell: true, cwd: fileDir });
        
        vscode.window.showInformationMessage(`PowerBASIC: Compilation successful!`);
        updateStatusBar('Ready');
        console.log(output);
    } catch (error) {
        const errorMessage = error.stderr ? error.stderr.toString() : error.message;
        vscode.window.showErrorMessage(`PowerBASIC Compilation Error:\n${errorMessage}`);
        updateStatusBar('Ready');
        console.error(errorMessage);
        throw error;
    }
}

async function runFile() {
    const folders = vscode.workspace.workspaceFolders;
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const filePath = document.uri.fsPath;
    const fileDir = path.dirname(filePath);
    let fileName = path.basename(filePath, path.extname(filePath));


    for (let index = 0; index < folders.length; index++) {
        console.log(`folder name: ${folders[index].uri.toString()}`);
        fs.readdirSync(folders[index].uri.fsPath).forEach(file => {
        // will also include directory names
        if(file.endsWith('.bas') && !file.startsWith('Backup')){
            console.log(`Found file: ${file}`);
            fileName = file.replace('.bas','');
        }
        });
        
    }

    const exePath = path.join(fileDir, fileName + '.EXE');

    // Check if executable exists
    if (!fs.existsSync(exePath)) {
        vscode.window.showErrorMessage(`Executable not found: ${exePath}. Please compile first.`);
        return;
    }

    try {

        await new Promise(resolve => setTimeout(resolve, 500));
        updateStatusBar('Running...');
    
        
        if (process.platform === 'linux') {
            exec(`wine "${exePath}"`);
        } else {
            exec(`"${exePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            });
        }

        updateStatusBar('Running');
    } catch (error) {
        updateStatusBar('Run Failed');
        vscode.window.showErrorMessage(`Failed to run executable: ${error.message}`);
    }
}

async function compileAndRun() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'powerbasic') {
        vscode.window.showErrorMessage('No PowerBASIC file is currently active');
        return;
    }

    try {
        // First compile
        await compileFile();
        
        await runFile();

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to compile and run: ${error.message}`);
    }
}

function deactivate() {
    if (statusBar) {
        statusBar.dispose();
    }
}

function showDDTReference() {
    vscode.window.showInformationMessage(
        'PBFORMS DDT Reference Guide',
        'Dialog Styles',
        'Control Styles',
        'Help'
    ).then(selection => {
        if (selection === 'Dialog Styles') {
            showDialogStylesInfo();
        } else if (selection === 'Control Styles') {
            showControlStylesInfo();
        } else if (selection === 'Help') {
            vscode.window.showInformationMessage(
                'PBFORMS (PowerBASIC Forms) generates Dynamic Dialog Tools (DDT) code. ' +
                'Use DIALOG and CONTROL ADD statements to create UI elements. ' +
                'See the extension documentation for complete references.'
            );
        }
    });
}

function showDialogStylesInfo() {
    const dialogStyles = `
DIALOG Styles (Common):
- %DS_3DLOOK          : 3D appearance
- %DS_CENTER          : Center dialog
- %DS_CENTERMOUSE     : Center mouse cursor
- %DS_MODALFRAME      : Modal dialog frame
- %DS_NOFAILCREATE    : Create even on errors
- %DS_SETFONT         : Use DIALOG FONT

Window Styles:
- %WS_CAPTION         : Title bar
- %WS_SYSMENU         : System menu
- %WS_THICKFRAME      : Resizable border
- %WS_MINIMIZEBOX     : Minimize button
- %WS_MAXIMIZEBOX     : Maximize button
- %WS_POPUP           : Popup dialog
- %WS_CHILD           : Child dialog
    `;
    
    vscode.window.showInformationMessage(
        dialogStyles,
        { modal: true }
    );
}

function showControlStylesInfo() {
    const controlStyles = `
Common Control Styles:
- %BS_PUSHBUTTON      : Push button
- %BS_DEFAULT         : Default button
- %BS_AUTOCHECKBOX    : Auto-toggle checkbox
- %BS_AUTORADIOBUTTON : Auto-toggle radio button
- %BS_NOTIFY          : Send focus notifications
- %BS_FLAT            : Flat appearance
- %ES_MULTILINE       : Multi-line textbox
- %ES_PASSWORD        : Password masking
- %ES_READONLY        : Read-only textbox
- %WS_TABSTOP         : Tab stop enabled
- %WS_VISIBLE         : Visible
- %WS_DISABLED        : Initially disabled
    `;
    
    vscode.window.showInformationMessage(
        controlStyles,
        { modal: true }
    );
}

function insertControlTemplate() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    vscode.window.showQuickPick([
        { label: 'DIALOG Template', value: 'dialog' },
        { label: 'BUTTON Control', value: 'button' },
        { label: 'TEXTBOX Control', value: 'textbox' },
        { label: 'CHECKBOX Control', value: 'checkbox' },
        { label: 'COMBOBOX Control', value: 'combobox' },
        { label: 'LISTBOX Control', value: 'listbox' },
        { label: 'LABEL Control', value: 'label' },
        { label: 'FRAME Control', value: 'frame' }
    ]).then(selection => {
        if (!selection) return;

        let template = '';
        switch (selection.value) {
            case 'dialog':
                template = `DIALOG NEW PIXELS, 0, "Dialog Title", 0, 0, 300, 200, _
                    %WS_SYSMENU OR %WS_CAPTION OR %WS_THICKFRAME TO hDlg
' Dialog content goes here
DIALOG SHOW MODAL hDlg`;
                break;
            case 'button':
                template = `CONTROL ADD BUTTON, hDlg, IDC_BUTTON1, "Button Text", 10, 10, 100, 14, %WS_TABSTOP`;
                break;
            case 'textbox':
                template = `CONTROL ADD TEXTBOX, hDlg, IDC_TEXTBOX1, "", 10, 30, 200, 14, %WS_TABSTOP OR %ES_LEFT`;
                break;
            case 'checkbox':
                template = `CONTROL ADD CHECKBOX, hDlg, IDC_CHECK1, "Checkbox Text", 10, 50, 200, 10, %WS_TABSTOP`;
                break;
            case 'combobox':
                template = `CONTROL ADD COMBOBOX, hDlg, IDC_COMBO1, "", 10, 70, 200, 100, %WS_TABSTOP OR %CBS_DROPDOWN`;
                break;
            case 'listbox':
                template = `CONTROL ADD LISTBOX, hDlg, IDC_LIST1, 10, 90, 200, 100, %WS_TABSTOP OR %WS_BORDER`;
                break;
            case 'label':
                template = `CONTROL ADD LABEL, hDlg, -1, "Label Text", 10, 110, 200, 10`;
                break;
            case 'frame':
                template = `CONTROL ADD FRAME, hDlg, -1, "Group Frame", 5, 5, 290, 190`;
                break;
        }

        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, template);
        });
    });
}

function deactivate() {
    if (statusBar) {
        statusBar.dispose();
    }
}

class PowerBASICDefinitionProvider {
    async provideDefinition(document, position, token) {
        const word = document.getWordRangeAtPosition(position);
        if (!word) {
            console.log('[PowerBASIC Definition] No word found at position');
            return null;
        }

        // Get the word and check if it includes % prefix
        let symbol = document.getText(word);
        const beforeWord = document.getText(new vscode.Range(new vscode.Position(position.line, Math.max(0, word.start.character - 1)), word.start));
        
        // If there's a % before the word, include it
        if (beforeWord === '%') {
            symbol = '%' + symbol;
        }
        
        console.log(`[PowerBASIC Definition] Looking for symbol: "${symbol}" in file: ${document.uri.fsPath}`);
        
        // Search in current file first
        console.log(`[PowerBASIC Definition] Searching in current file...`);
        const currentFileMatch = this.searchSymbolInFile(document, symbol);
        if (currentFileMatch) {
            console.log(`[PowerBASIC Definition] Found definition in current file at line ${currentFileMatch.range.start.line}`);
            return currentFileMatch;
        }

        // Search in all PowerBASIC files in the workspace
        console.log(`[PowerBASIC Definition] Searching workspace files...`);
        const files = await vscode.workspace.findFiles('**/*.{bas,bi,inc}', '**/node_modules/**');
        console.log(`[PowerBASIC Definition] Found ${files.length} PowerBASIC files in workspace`);
        
        for (const file of files) {
            if (file.fsPath === document.uri.fsPath) {
                console.log(`[PowerBASIC Definition] Skipping current file: ${file.fsPath}`);
                continue;
            }
            
            console.log(`[PowerBASIC Definition] Searching in file: ${file.fsPath}`);
            const fileDocument = await vscode.workspace.openTextDocument(file);
            const match = this.searchSymbolInFile(fileDocument, symbol);
            if (match) {
                console.log(`[PowerBASIC Definition] FOUND in ${file.fsPath} at line ${match.range.start.line}`);
                return match;
            }
        }

        console.log(`[PowerBASIC Definition] No definition found for "${symbol}"`);
        return null;
    }

    searchSymbolInFile(document, symbol) {
        // Check if this is a % constant or regular function/class
        const isConstant = symbol.startsWith('%');
        
        // Search through all lines for definitions
        for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
            const line = document.lineAt(lineNumber);
            
            if (isConstant) {
                const match = this.findConstantDefinition(document, line.text, symbol, lineNumber);
                if (match) return match;
            } else {
                const match = this.findSymbolInLine(document, line.text, symbol, lineNumber);
                if (match) return match;
            }
        }

        return null;
    }

    findConstantDefinition(document, lineText, symbol, lineNumber) {
        const lowerLine = lineText.toLowerCase();
        const lowerSymbol = symbol.toLowerCase();
        
        // Look for constant definitions: #define, %constant = value, or CONST %constant
        if (!/(%[A-Z_])/i.test(lowerLine)) {
            return null;
        }
        
        console.log(`[PowerBASIC Definition] Line ${lineNumber}: "${lineText}"`);
        
        // Search for the constant
        const symbolPos = lowerLine.indexOf(lowerSymbol);
        if (symbolPos === -1) {
            console.log(`[PowerBASIC Definition]   Symbol "${symbol}" not found`);
            return null;
        }
        
        console.log(`[PowerBASIC Definition]   Found "${symbol}" at position ${symbolPos}`);
        
        // Check if this is a definition context
        const afterContext = lowerLine.substring(symbolPos + symbol.length, lowerLine.length).trim();
        console.log(`[PowerBASIC Definition]   Full context after symbol: "${afterContext}"`);
        if (afterContext.match(/=/)) {
            console.log(`[PowerBASIC Definition]   ✓ CONSTANT DEFINITION FOUND!`);
            return new vscode.Location(
                document.uri,
                new vscode.Range(
                    new vscode.Position(lineNumber, symbolPos),
                    new vscode.Position(lineNumber, symbolPos + symbol.length)
                )
            );
        }

        return null;
    }

    findSymbolInLine(document, lineText, symbol, lineNumber) {
        const lowerLine = lineText.toLowerCase();
        const lowerSymbol = symbol.toLowerCase();
        
        // Test if line contains relevant keywords
        if (!/(function|sub|method|declare|class|type|interface)/.test(lowerLine)) {
            return null;
        }
        
        console.log(`[PowerBASIC Definition] Line ${lineNumber}: "${lineText}"`);
        
        // Try to find the symbol name in the line
        let searchIndex = 0;
        while (true) {
            const symbolPos = lowerLine.indexOf(lowerSymbol, searchIndex);
            if (symbolPos === -1) break;
            
            console.log(`[PowerBASIC Definition]   Found "${symbol}" at position ${symbolPos}`);
            
            // Check if this is a word boundary match
            const beforeChar = symbolPos > 0 ? lineText[symbolPos - 1] : ' ';
            const afterChar = symbolPos + symbol.length < lineText.length ? lineText[symbolPos + symbol.length] : ' ';
            
            console.log(`[PowerBASIC Definition]   Boundary check: before="${beforeChar}" after="${afterChar}"`);
            
            // Valid word boundary: space, punctuation, or beginning/end
            if (/[\s(\[_]/.test(beforeChar) && /[\s()[\],:=]|$/.test(afterChar)) {
                console.log(`[PowerBASIC Definition]   Word boundary valid`);
                
                // Verify this symbol is actually in a definition line
                const beforeContext = lowerLine.substring(0, symbolPos);
                console.log(`[PowerBASIC Definition]   Full context before symbol: "${beforeContext}"`);
                
                // Check if any definition keyword appears before the symbol
                if (/(function|sub|method|class|type|interface)\s+$/.test(beforeContext.trim()) || 
                    /\b(function|sub|method|class|type|interface)\s+$/.test(beforeContext) ||
                    /\bdeclare\s+(function|sub|method)\s+$/.test(beforeContext)) {
                    console.log(`[PowerBASIC Definition]   ✓ MATCH FOUND!`);
                    return new vscode.Location(
                        document.uri,
                        new vscode.Range(
                            new vscode.Position(lineNumber, symbolPos),
                            new vscode.Position(lineNumber, symbolPos + symbol.length)
                        )
                    );
                } else {
                    console.log(`[PowerBASIC Definition]   Context pattern: "${beforeContext.trim()}"`);
                    console.log(`[PowerBASIC Definition]   Context does not match definition pattern`);
                }
            } else {
                console.log(`[PowerBASIC Definition]   Word boundary invalid`);
            }
            
            searchIndex = symbolPos + 1;
        }
        
        return null;
    }
}

class PowerBASICHoverProvider {
    async provideHover(document, position, token) {
        const word = document.getWordRangeAtPosition(position);
        if (!word) return null;

        const symbol = document.getText(word);
        console.log(`[PowerBASIC Hover] Looking up: "${symbol}"`);

        // Get variable type from current document
        const variableType = this.getVariableType(document, symbol);
        if (variableType) {
            const hoverText = new vscode.MarkdownString(`**Type:** \`${variableType}\``);
            return new vscode.Hover(hoverText);
        }

        // Try to find type in other files
        const files = await vscode.workspace.findFiles('**/*.{bas,bi,inc}', '**/node_modules/**');
        for (const file of files) {
            const fileDocument = await vscode.workspace.openTextDocument(file);
            const type = this.getVariableType(fileDocument, symbol);
            if (type) {
                const hoverText = new vscode.MarkdownString(`**Type:** \`${type}\` (from ${path.basename(file.fsPath)})`);
                return new vscode.Hover(hoverText);
            }
        }

        return null;
    }

    getVariableType(document, symbol) {
        const lowerSymbol = symbol.toLowerCase();
        
        // Search for variable declarations in the document
        for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
            const line = document.lineAt(lineNumber);
            const lowerLine = line.text.toLowerCase();
            
            // Check for DIM declaration
            const dimMatch = lowerLine.match(/\b(dim|local|static|redim|const)\s+/i);
            if (dimMatch) {
                const type = this.extractTypeFromDeclaration(line.text, symbol, lowerLine);
                if (type) return type;
            }
            
            // Check for function/sub parameters
            const paramType = this.extractParameterType(line.text, symbol, lowerLine);
            if (paramType) return paramType;
        }
        
        return null;
    }

    extractTypeFromDeclaration(lineText, symbol, lowerLine) {
        const lowerSymbol = symbol.toLowerCase();
        
        // Find the symbol in the line
        const symbolIndex = lowerLine.indexOf(lowerSymbol);
        if (symbolIndex === -1) return null;
        
        // Check word boundaries
        const beforeChar = symbolIndex > 0 ? lineText[symbolIndex - 1] : ' ';
        const afterChar = symbolIndex + symbol.length < lineText.length ? lineText[symbolIndex + symbol.length] : ' ';
        if (!/[\s(,]/.test(beforeChar) || !/[\s,()=]|$/.test(afterChar)) {
            return null;
        }
        
        // Look for type specification AFTER the symbol
        const afterSymbol = lineText.substring(symbolIndex + symbol.length);
        const lowerAfter = afterSymbol.toLowerCase();
        
        // Match: AS TYPE
        const asMatch = afterSymbol.match(/^\s+AS\s+(\w+)/i);
        if (asMatch) {
            return asMatch[1];
        }
        
        // Match: BYVAL TYPE
        const byvalMatch = afterSymbol.match(/^\s+BYVAL\s+(\w+)/i);
        if (byvalMatch) {
            return byvalMatch[1];
        }
        
        // Match: BYREF TYPE
        const byrefMatch = afterSymbol.match(/^\s+BYREF\s+(\w+)/i);
        if (byrefMatch) {
            return byrefMatch[1];
        }
        
        // Also try matching the whole line for DIM var AS type pattern
        const declMatch = lineText.match(new RegExp(`\\bDIM\\s+${lowerSymbol}\\s+AS\\s+(\\w+)`, 'i'));
        if (declMatch) {
            return declMatch[1];
        }
        
        // Try matching DIM var BYVAL/BYREF type pattern
        const declMatch2 = lineText.match(new RegExp(`\\bDIM\\s+${lowerSymbol}\\s+(?:BYVAL|BYREF)\\s+(\\w+)`, 'i'));
        if (declMatch2) {
            return declMatch2[1];
        }
        
        return null;
    }

    extractParameterType(lineText, symbol, lowerLine) {
        const lowerSymbol = symbol.toLowerCase();
        
        // Check if this is a function/sub declaration
        if (!/(function|sub|method|property|declare)\b/.test(lowerLine)) {
            return null;
        }
        
        // Look for parameter in parentheses: (param BYVAL/BYREF/AS type, ...)
        const paramPattern = /\(\s*([^)]*)\s*\)/;
        const paramMatch = lineText.match(paramPattern);
        
        if (!paramMatch) return null;
        
        const paramList = paramMatch[1];
        const params = paramList.split(',');
        
        for (const param of params) {
            const paramLower = param.toLowerCase();
            
            // Check if this parameter is our symbol
            if (paramLower.includes(lowerSymbol)) {
                // Try various parameter type patterns
                
                // Pattern: paramName AS type
                let typeMatch = param.match(new RegExp(`${lowerSymbol}\\s+AS\\s+(\\w+)`, 'i'));
                if (typeMatch) {
                    return typeMatch[1];
                }
                
                // Pattern: paramName BYVAL type
                typeMatch = param.match(new RegExp(`${lowerSymbol}\\s+BYVAL\\s+(\\w+)`, 'i'));
                if (typeMatch) {
                    return typeMatch[1];
                }
                
                // Pattern: paramName BYREF type
                typeMatch = param.match(new RegExp(`${lowerSymbol}\\s+BYREF\\s+(\\w+)`, 'i'));
                if (typeMatch) {
                    return typeMatch[1];
                }
                
                // Pattern: BYVAL paramName AS type or just BYVAL type
                typeMatch = param.match(/BYVAL\s+(\w+)/i);
                if (typeMatch && param.includes(lowerSymbol)) {
                    return typeMatch[1];
                }
                
                // Pattern: BYREF paramName AS type or just BYREF type
                typeMatch = param.match(/BYREF\s+(\w+)/i);
                if (typeMatch && param.includes(lowerSymbol)) {
                    return typeMatch[1];
                }
            }
        }
        
        return null;
    }
}

module.exports = {
    activate,
    deactivate
};
