# PowerBASIC VS Code Extension - Quick Start Guide

## 5-Minute Quick Start

### 1. Install PBWIN.exe (5 minutes)

**Windows:**
1. Download from [powerbasic.com](https://www.powerbasic.com/)
2. Run installer
3. Note installation path

**Linux:**
```bash
sudo apt install wine
wine PowerBASIC-Installer.exe  # Install Windows version with Wine
```

### 2. Install Extension (1 minute)

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search "PowerBASIC"
4. Click Install

### 3. Configure (2 minutes, optional)

If PBWIN.exe is not in PATH:
1. Open Settings (Ctrl+,)
2. Search "powerbasic.pbwinPath"
3. Set path: `C:\Program Files\PowerBASIC\PBWIN.exe`

### 4. Create First Program

Create file `hello.bas`:
```powerbasic
FUNCTION PBMAIN() AS LONG
    ? "Hello, PowerBASIC!"
    FUNCTION = 0
END FUNCTION
```

### 5. Build & Run

1. Press **Ctrl+Shift+B** to compile
2. Press **Ctrl+F5** to run
3. Done! 🎉

## Available Commands

| Command | Shortcut | What It Does |
|---------|----------|------------|
| Compile | Ctrl+Shift+B | Build to .exe |
| Run | Ctrl+F5 | Execute program |
| Compile & Run | Ctrl+Alt+B | Build then run |

## Common Errors & Fixes

| Error | Solution |
|-------|----------|
| "PBWIN.exe not found" | Set `powerbasic.pbwinPath` in settings |
| "Permission denied" | Ensure file has read/write permissions |
| "No executable found" | Compile first (Ctrl+Shift+B) |
| Wine issues | Verify: `wine --version` and reinstall if needed |

## Example Programs

Try these in `examples/` folder:

1. **hello.bas** - Basic output
   ```bash
   Ctrl+Shift+B  # Compile
   Ctrl+F5       # Run
   ```

2. **calculator.bas** - Interactive program
3. **arrays.bas** - Array manipulation
4. **subroutines.bas** - Functions/SUBs

## File Structure

```
MyProject/
├── src/
│   ├── main.bas        # Your program
│   └── helpers.bi      # Header files
├── bin/                # Compiled executables (created)
└── .vscode/
    └── settings.json   # Configuration
```

## Essential Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+Shift+B | Compile |
| Ctrl+F5 | Run |
| Ctrl+K Ctrl+C | Comment |
| Ctrl+/ | Toggle comment |
| Ctrl+Shift+X | Extensions |
| Ctrl+, | Settings |
| Ctrl+` | Terminal |

## PowerBASIC Basics

### Main Entry Point
```powerbasic
FUNCTION PBMAIN() AS LONG
    ' Your code here
    FUNCTION = 0
END FUNCTION
```

### Output
```powerbasic
? "Hello"               ' Print and newline
PRINT "Text"            ' Same as ?
? "Value: " & value     ' Concatenation
```

### Input
```powerbasic
DIM name$ AS STRING
INPUT "Your name: ", name$
```

### Loops
```powerbasic
FOR i = 1 TO 10
    ? i
NEXT

WHILE condition
    ' code
WEND
```

### Conditions
```powerbasic
IF x > 5 THEN
    ? "Greater"
ELSE
    ? "Smaller"
END IF

SELECT CASE choice
    CASE 1: ? "One"
    CASE 2: ? "Two"
END SELECT
```

### Functions
```powerbasic
FUNCTION Add(a AS LONG, b AS LONG) AS LONG
    FUNCTION = a + b
END FUNCTION

FUNCTION PBMAIN() AS LONG
    DIM result AS LONG
    result = Add(5, 3)
    ? result
    FUNCTION = 0
END FUNCTION
```

## Settings Quick Reference

Open Settings (Ctrl+,) and search "powerbasic":

```json
{
    "powerbasic.pbwinPath": "C:\\PBWin10\\bin\\PBWin.exe",
    "powerbasic.includeDirectory": "C:\\PBWin10\\WinAPI\\",
    "powerbasic.useWineOnLinux": true
}
```

## Troubleshooting Quick Guide

**Problem**: Can't compile
- **Solution**: Check `powerbasic.pbwinPath` setting points to PBWIN.exe

**Problem**: Can't find include files
- **Solution**: Check `powerbasic.includeDirectory` setting points to WinAPI folder

**Problem**: File won't run on Linux
- **Solution**: Enable `powerbasic.useWineOnLinux: true`

**Problem**: Syntax highlighting not working
- **Solution**: Save file as `.bas` or `.bi`

## Getting More Help

| Topic | Where |
|-------|-------|
| Installation | INSTALLATION.md |
| Language syntax | LANGUAGE_REFERENCE.md |
| Advanced config | ADVANCED_CONFIG.md |
| Extension dev | DEVELOPMENT.md |
| All features | README.md |

## Pro Tips

1. **Use Option Explicit** - Avoid typos
   ```powerbasic
   OPTION EXPLICIT
   DIM myVar AS LONG
   ```

2. **Comment Your Code**
   ```powerbasic
   ' Calculate total
   total = price * quantity
   ```

3. **Test Incrementally** - Compile often
4. **Use Meaningful Names** - `customerCount` not `c`
5. **Error Handling** - Use ON ERROR
   ```powerbasic
   ON ERROR GOTO Handler
   ' code
   Handler:
       ? "Error: " & ERROR$
   END
   ```

## Useful Links

- [PowerBASIC Official](https://www.powerbasic.com/)
- [VS Code Docs](https://code.visualstudio.com/docs)
- Full Documentation in Extension:
  - README.md
  - LANGUAGE_REFERENCE.md
  - INSTALLATION.md

## Project Templates

### Console Application
```powerbasic
' console.bas
FUNCTION PBMAIN() AS LONG
    DIM input$ AS STRING
    CLS
    PRINT "Enter something: ";
    INPUT input$
    PRINT "You entered: " & input$
    PRINT "Press any key..."
    WAITKEY$
    FUNCTION = 0
END FUNCTION
```

### With Error Handling
```powerbasic
' safe.bas
FUNCTION PBMAIN() AS LONG
    ON ERROR GOTO ErrorHandler
    
    DIM x AS LONG, y AS LONG
    INPUT "Enter X: ", x
    INPUT "Enter Y: ", y
    IF y = 0 THEN ERROR 11  ' Division by zero
    ? "Result: " & (x / y)
    FUNCTION = 0

ErrorHandler:
    ? "Error " & ERR & ": " & ERROR$
    FUNCTION = ERR
END FUNCTION
```

## Workflow Example

1. **Create** file: `Ctrl+N`
2. **Save as**: `Ctrl+Shift+S` → `program.bas`
3. **Write code**
4. **Compile**: `Ctrl+Shift+B`
5. **Fix errors** if needed
6. **Run**: `Ctrl+F5`
7. **Test output**
8. **Repeat** steps 3-7

---

**You're all set! Happy coding with PowerBASIC! 🚀**

Need help? See the full documentation files in the extension directory.
