# PowerBASIC VS Code Extension - Installation Guide

## System Requirements

- **VS Code**: 1.35.0 or later
- **PowerBASIC**: Compiler for Windows Version 10 or compatible
- **Windows**: XP SP3 or later (natively)
- **Linux**: Wine 5.0+ with PowerBASIC for Windows installed

## Windows Installation

### Step 1: Install PowerBASIC Compiler
1. Download PowerBASIC Compiler for Windows from [powerbasic.com](https://www.powerbasic.com/)
2. Run the installer and follow the setup wizard
3. Note the installation directory (typically `C:\Program Files\PowerBASIC`)
4. Ensure the installation includes PBWIN.exe

### Step 2: Configure PATH (Optional)
To use PBWIN.exe from anywhere without configuring path in settings:

1. Open Environment Variables:
   - Windows 10/11: Search for "Environment Variables" → "Edit the system environment variables"
   - Right-click Computer → Properties → Advanced → Environment Variables

2. Under System variables, click "New":
   - Variable name: `PATH`
   - Variable value: `C:\Program Files\PowerBASIC\` (or your installation path)

3. Click OK and restart VS Code

### Step 3: Install VS Code Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PowerBASIC" or "lang-powerbasic"
4. Click Install
5. Reload VS Code if prompted

### Step 4: Configure Extension (Optional)
If PBWIN.exe is not at the default location, configure the path:

1. Open Settings (Ctrl+,)
2. Search for "powerbasic"
3. Configure the path:
   ```
   powerbasic.pbwinPath: C:\Program Files\PowerBASIC\PBWIN.exe
   ```

Alternatively, configure include directory if needed:
   ```
   powerbasic.includeDirectory: C:\PBWin10\WinAPI\
   ```

## Linux Installation with Wine

### Step 1: Install Wine
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install wine wine32 wine64

# Fedora
sudo dnf install wine

# Verify installation
wine --version
```

### Step 2: Install PowerBASIC in Wine
```bash
# Download PowerBASIC installer for Windows
# Run installer with Wine
wine PowerBASIC-Installer.exe

# Note the installation path (usually ~/.wine/drive_c/Program Files/PowerBASIC)
```

### Step 3: Test Wine Configuration
```bash
# Test PBWIN.exe
wine pbwin.exe /?

# Should display version and command-line help
```

### Step 4: Install VS Code Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PowerBASIC" or "lang-powerbasic"
4. Click Install
5. Reload VS Code if prompted

### Step 5: Configure Extension for Linux
1. Open Settings (Ctrl+,)
2. Search for "powerbasic"
3. Configure these settings:
   ```
   powerbasic.pbwinPath: pbwin.exe
   powerbasic.includeDirectory: C:\PBWin10\WinAPI\
   powerbasic.useWineOnLinux: true
   ```

## Verification

### Windows
```powershell
# Test PBWIN.exe
pbwin.exe /?
```

### Linux
```bash
# Test Wine + PBWIN
wine pbwin.exe /?
```

## Troubleshooting

### "PBWIN.exe not found" Error

**Windows:**
1. Verify PowerBASIC installation:
   ```powershell
   Get-Command pbwin.exe
   ```
2. If not found, add to PATH (see Step 2 above)
3. Or configure full path in extension settings

**Linux:**
1. Verify Wine is installed:
   ```bash
   wine --version
   ```
2. Test PBWIN.exe:
   ```bash
   wine pbwin.exe /?
   ```
3. If error, reinstall PowerBASIC in Wine:
   ```bash
   # Remove old wine prefix
   rm -rf ~/.wine
   
   # Reinstall PowerBASIC
   wine PowerBASIC-Installer.exe
   ```

### PBWIN.exe Crashes or Errors

1. Check PBWIN.exe version compatibility
2. Update Wine to latest stable version
3. Check available disk space (needs ~500MB for compilation)
4. Check file permissions on .bas files

### Terminal Issues (Linux)

If Wine programs don't display in terminal correctly:

```bash
# Try with explicit terminal
DISPLAY=:0 wine pbwin.exe ...

# Or set Wine environment variables
export WINEARCH=win32
export WINEPREFIX=~/.wine32
wine pbwin.exe /?
```

## Uninstallation

### Windows
1. Open Extensions in VS Code (Ctrl+Shift+X)
2. Find "PowerBASIC" extension
3. Click Uninstall
4. (Optional) Uninstall PowerBASIC compiler from Control Panel

### Linux
1. Open Extensions in VS Code (Ctrl+Shift+X)
2. Find "PowerBASIC" extension
3. Click Uninstall
4. (Optional) Remove Wine and PowerBASIC:
   ```bash
   sudo apt remove wine wine32 wine64
   rm -rf ~/.wine  # Remove Wine prefix
   ```

## Support

If you encounter issues:

1. Check the README.md for general documentation
2. Review error messages in VS Code Output panel
3. Check system requirements are met
4. Visit [PowerBASIC Official Site](https://www.powerbasic.com/)
5. Submit issues to the GitHub repository

---

**Note**: PowerBASIC is a proprietary compiler. Ensure you have a valid license before use.
