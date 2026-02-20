# PowerBASIC Language Support for VS Code

A comprehensive VS Code extension providing complete PowerBASIC language support including syntax highlighting, code completion, PBFORMS DDT support, and full compilation/execution capabilities.

## Features

### Language Support
- **Syntax Highlighting**: Full PowerBASIC syntax highlighting with support for:
  - Keywords and control structures
  - Data types and type modifiers
  - String literals and escape sequences
  - Comments (REM, apostrophe, and block comments)
  - Preprocessor directives
  - Built-in functions and procedures
  - Operators and intrinsic constants

- **PBFORMS (DDT) Support**: Complete syntax highlighting for Dynamic Dialog Tools:
  - DIALOG statements and styles
  - CONTROL ADD statements with all control types
  - Dialog and control style constants (%DS_*, %WS_*, %BS_*, %ES_*, etc.)
  - Callback function patterns
  - Control operation statements
  
- **IntelliSense**: Code completion for PowerBASIC keywords and functions

### Compilation & Execution
- **Compile Only**: Compile PowerBASIC source to executable
- **Run**: Execute compiled PowerBASIC programs
- **Compile & Run**: Build and execute in one command
- **Error Detection**: Built-in PBWIN.exe availability checking with error messages
- **Wine Support**: Automatic Wine integration for running on Linux hosts

### Configuration
Customize PowerBASIC compilation:

```json
{
    "powerbasic.pbwinPath": "C:\\PBWin10\\bin\\PBWin.exe",
    "powerbasic.includeDirectory": "C:\\PBWin10\\WinAPI\\",
    "powerbasic.useWineOnLinux": true
}
```

## Installation & Setup

### Windows
1. Install [PowerBASIC Compiler for Windows](https://www.powerbasic.com/)
2. Ensure PBWIN.exe is in your PATH or configure `powerbasic.pbwinPath`
3. Install this extension from VS Code Marketplace

### Linux (with Wine)
1. Install Wine: `sudo apt-get install wine wine32 wine64`
2. Install PowerBASIC for Windows via Wine
3. Set `powerbasic.useWineOnLinux: true` in settings

## Usage

### Keyboard Shortcuts
- **Ctrl+Shift+B**: Compile current file
- **Ctrl+F5**: Run compiled executable
- **Ctrl+Alt+B**: Compile and Run

### Command Palette
Press `Ctrl+Shift+P` and search for:
- `PowerBASIC: Compile Current File`
- `PowerBASIC: Run Current File`
- `PowerBASIC: Compile and Run`
- `PBFORMS: Show DDT Reference` - View dialog and control style reference
- `PBFORMS: Insert Control Template` - Insert common control definitions

### PBFORMS/DDT Support
The extension includes comprehensive PBFORMS support:
- Full syntax highlighting for DDT code generation
- Quick reference for dialog and control styles
- Control template insertion
- See [PBFORMS.md](PBFORMS.md) for complete DDT reference

### File Extensions
Supported file extensions: `.bas`, `.bi`

### Compilation
The extension automatically:
- Saves your file before compilation
- Checks for PBWIN.exe availability
- Displays compilation errors and success messages
- Outputs executable in the same directory as the source file
- Includes the WinAPI directory in the compiler search path

## Troubleshooting

### PBWIN.exe Not Found
1. Verify PBWIN.exe is installed and in PATH
2. Check `powerbasic.pbwinPath` setting:
   ```json
   "powerbasic.pbwinPath": "C:/Program Files/PowerBASIC/PBWIN.exe"
   ```
3. Restart VS Code

### Wine Issues (Linux)
1. Verify Wine is installed: `wine --version`
2. Test PBWIN: `wine pbwin.exe /?`
3. Enable debug output in VS Code terminal

### Compilation Errors
- Check file syntax matches PowerBASIC specification
- Verify PBWIN.exe version compatibility
- Review error messages in Output panel

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `powerbasic.pbwinPath` | `C:\PBWin10\bin\PBWin.exe` | Path to PBWIN.exe compiler |
| `powerbasic.includeDirectory` | `C:\PBWin10\WinAPI\` | Include directory path for PBWIN.exe compiler |
| `powerbasic.useWineOnLinux` | `true` | Use Wine on Linux for PBWIN.exe |

## Building from Source

This extension requires:
- VS Code 1.35.0 or later
- Node.js 12+ (for development)

### Development
```bash
# Install dependencies
npm install

# Run extension in development mode
# Press F5 in VS Code with this folder open
```

## Credits

- PowerBASIC compiler documentation: PowerBASIC Tools, LLC
- Built for VS Code 1.35.0+

## License

See LICENSE file for details.

## Support

For issues, feature requests, or questions:
- GitHub: https://github.com/ReFil/vscode-powerbasic
- PowerBASIC: https://www.powerbasic.com/

---

**PowerBASIC** is a registered trademark of PowerBASIC Tools, LLC.
