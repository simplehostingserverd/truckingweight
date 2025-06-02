# 🔧 Node.js Version Management Guide

## ⚠️ Critical: Node.js 20.x Required

The Cosmo Exploit Group LLC Weight Management System is specifically designed for **Node.js 20.x**. Using other versions (especially newer ones like 24.x) may cause compatibility issues.

## 🔍 Check Your Current Version

```bash
node --version
```

**Expected output**: `v20.x.x` (e.g., `v20.18.0`)

## 🚨 If You're Using the Wrong Version

### Quick Fix (Recommended)
```bash
# Use our automated helper script
npm run switch-node
```

### Manual Fix with NVM

#### Windows (nvm-windows)
```bash
# Install Node.js 20
nvm install 20.18.0

# Switch to Node.js 20
nvm use 20.18.0

# Set as default
nvm alias default 20.18.0
```

#### macOS/Linux (nvm)
```bash
# Install Node.js 20
nvm install 20.18.0

# Switch to Node.js 20
nvm use 20.18.0

# Set as default
nvm alias default 20.18.0
```

## 📥 Installing NVM (If Not Installed)

### Windows
1. Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Install the `nvm-setup.zip` file
3. Restart your terminal
4. Verify: `nvm --version`

### macOS/Linux
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc

# Verify installation
nvm --version
```

## 🔄 Automatic Version Switching

### Option 1: Use .nvmrc (Recommended)
The project includes a `.nvmrc` file. Simply run:
```bash
nvm use
```

### Option 2: Add to Your Shell Profile
Add this to your `~/.bashrc`, `~/.zshrc`, or equivalent:
```bash
# Auto-switch Node.js version when entering project directory
cd() {
  builtin cd "$@"
  if [[ -f .nvmrc ]]; then
    nvm use
  fi
}
```

## 🐛 Troubleshooting

### "nvm: command not found"
- **Windows**: Restart terminal after installing nvm-windows
- **macOS/Linux**: Run `source ~/.bashrc` or restart terminal

### "Version 'X' is not installed"
```bash
# Install the required version
nvm install 20.18.0
nvm use 20.18.0
```

### Permission Errors
```bash
# On macOS/Linux, you might need to fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Multiple Node.js Installations
```bash
# List all installed versions
nvm list

# Uninstall unwanted versions
nvm uninstall 24.1.0
```

## ✅ Verification Steps

After switching to Node.js 20.x:

1. **Check Node.js version**:
   ```bash
   node --version
   # Should show v20.x.x
   ```

2. **Check npm version**:
   ```bash
   npm --version
   # Should show 10.x.x or higher
   ```

3. **Run requirements check**:
   ```bash
   npm run check-requirements
   ```

4. **Test the application**:
   ```bash
   npm run install-deps
   npm run dev
   ```

## 🎯 Why Node.js 20.x?

- **Stability**: Node.js 20.x is the current LTS (Long Term Support) version
- **Compatibility**: All dependencies are tested with Node.js 20.x
- **Performance**: Optimized for Node.js 20.x features
- **Security**: Regular security updates for LTS versions

## 📋 Quick Reference

| Command | Description |
|---------|-------------|
| `node --version` | Check current Node.js version |
| `nvm list` | List installed Node.js versions |
| `nvm install 20` | Install Node.js 20.x |
| `nvm use 20` | Switch to Node.js 20.x |
| `npm run switch-node` | Use our helper script |
| `npm run check-requirements` | Verify all requirements |

## 🆘 Still Having Issues?

1. Run our diagnostic script: `npm run check-requirements`
2. Check the main [SETUP.md](SETUP.md) guide
3. Review the [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) guide
4. Contact: info@cosmoexploitgroup.com

---

**Remember**: Always use Node.js 20.x for this project to ensure compatibility and optimal performance.
