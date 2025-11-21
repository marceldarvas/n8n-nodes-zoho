# Phase 4: Package Configuration

> Update package.json and build configuration to include Zoho Bigin node

## 📋 Overview

Phase 4 integrates the newly created Zoho Bigin node into the package configuration, ensuring it's properly registered with n8n and included in the build process.

**Priority**: Critical
**Estimated Effort**: 30 minutes - 1 hour
**Dependencies**: Phase 3 (Main Node Implementation)
**Blocks**: Phase 5 (Testing)

## 🎯 Objectives

1. ✅ Update package.json to register ZohoBigin node
2. ✅ Verify build configuration includes new node
3. ✅ Ensure dist/ output is correct
4. ✅ Test package installation process

## 📂 Files to Modify

### 1. package.json

**Location**: `/package.json`

**Current State** (lines 40-46):
```json
"n8n": {
  "credentials": [
    "dist/credentials/ZohoApi.credentials.js"
  ],
  "nodes": [
    "dist/nodes/ZohoSheets.node.js",
    "dist/nodes/ZohoBilling.node.js",
    "dist/nodes/ZohoTasks.node.js",
    "dist/nodes/ZohoEmail.node.js",
    "dist/nodes/ZohoCalendar.node.js"
  ]
}
```

**Required Change**:
```json
"n8n": {
  "credentials": [
    "dist/credentials/ZohoApi.credentials.js"
  ],
  "nodes": [
    "dist/nodes/ZohoSheets.node.js",
    "dist/nodes/ZohoBilling.node.js",
    "dist/nodes/ZohoTasks.node.js",
    "dist/nodes/ZohoEmail.node.js",
    "dist/nodes/ZohoCalendar.node.js",
    "dist/nodes/ZohoBigin.node.js"
  ]
}
```

#### Important Notes

1. **Path must reference compiled file**: `dist/nodes/ZohoBigin.node.js` (not `.ts`)
2. **File must exist after build**: Run `npm run build` to generate
3. **Order doesn't matter**: But alphabetical is cleaner
4. **Case sensitive**: Ensure exact match with actual filename

---

### 2. Verify Build Configuration

#### TypeScript Configuration (tsconfig.json)

**No changes needed** - Current configuration already compiles all `.ts` files in `nodes/` directory.

Verify these settings are present:
```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": ".",
    // ...
  },
  "include": [
    "credentials/**/*",
    "nodes/**/*"
  ]
}
```

#### Gulp Configuration (gulpfile.js)

**No changes needed** - Current gulp task copies all SVG files:
```javascript
gulp.task('default', () => {
    return gulp.src('nodes/**/*.svg')
        .pipe(gulp.dest('dist/nodes/'));
});
```

Since we're reusing the existing `zoho.svg` icon, no additional gulp configuration is required.

---

## 🔨 Build Process

### Step-by-Step Build

1. **Clean previous build** (optional but recommended):
```bash
rm -rf dist/
```

2. **Run build command**:
```bash
npm run build
```

This executes: `tsc && gulp`
- `tsc` - Compiles TypeScript to JavaScript in `dist/`
- `gulp` - Copies SVG icons to `dist/nodes/`

3. **Verify output**:
```bash
ls -la dist/nodes/
```

Expected files:
```
dist/nodes/
├── ZohoBigin.node.js
├── ZohoBigin.node.js.map
├── ZohoBigin.node.d.ts
├── ZohoBilling.node.js
├── ZohoCalendar.node.js
├── ZohoEmail.node.js
├── ZohoSheets.node.js
├── ZohoTasks.node.js
├── GenericFunctions.js
├── GenericFunctions.js.map
├── GenericFunctions.d.ts
├── types.js
├── types.d.ts
├── zoho.svg
└── descriptions/
    ├── index.js
    ├── BiginPipelinesDescription.js
    ├── BiginContactsDescription.js
    ├── ... (other description files)
```

4. **Check file sizes**:
```bash
ls -lh dist/nodes/ZohoBigin.node.js
```

Expected size: ~20-50KB depending on implementation

---

## 🧪 Testing Phase 4

### 1. Build Verification

```bash
# Clean build
rm -rf dist/
npm run build

# Check for errors
echo $?  # Should output 0 (success)

# Verify file exists
test -f dist/nodes/ZohoBigin.node.js && echo "✓ Build successful" || echo "✗ Build failed"
```

### 2. Package Validation

```bash
# Test package can be installed
npm pack

# This creates n8n-nodes-zoho-1.0.2.tgz (or current version)
# Verify the .tgz contains dist/nodes/ZohoBigin.node.js

tar -tzf n8n-nodes-zoho-*.tgz | grep ZohoBigin
```

Expected output:
```
package/dist/nodes/ZohoBigin.node.js
package/dist/nodes/ZohoBigin.node.js.map
package/dist/nodes/ZohoBigin.node.d.ts
package/dist/nodes/descriptions/BiginPipelinesDescription.js
package/dist/nodes/descriptions/BiginContactsDescription.js
... (other Bigin files)
```

### 3. n8n Integration Test

#### Option A: Local Development

```bash
# In the package directory
npm link

# In n8n directory
npm link n8n-nodes-zoho

# Restart n8n
# The Zoho Bigin node should now appear in the nodes panel
```

#### Option B: Direct Installation

```bash
# In n8n's custom nodes directory (~/.n8n/custom/)
npm install /path/to/n8n-nodes-zoho

# Restart n8n
```

#### Verification in n8n

1. Open n8n UI
2. Click "+" to add a node
3. Search for "Zoho Bigin"
4. Node should appear with:
   - ✅ Zoho icon (zoho.svg)
   - ✅ "Zoho Bigin" as display name
   - ✅ All 7 resources in dropdown
5. Select a resource and verify operations appear

---

## 📋 Acceptance Criteria

Phase 4 is complete when:

1. ✅ **package.json updated** with ZohoBigin node entry
2. ✅ **Build succeeds** without errors (`npm run build`)
3. ✅ **ZohoBigin.node.js exists** in dist/nodes/
4. ✅ **File size reasonable** (not empty, not excessively large)
5. ✅ **Package packs successfully** (`npm pack`)
6. ✅ **Node appears in n8n** after installation
7. ✅ **Icon displays correctly** (zoho.svg)
8. ✅ **No TypeScript errors** during build
9. ✅ **No TSLint warnings** (`npm run tslint`)
10. ✅ **Source maps generated** (.js.map files present)

---

## 🚨 Common Issues

### Issue 1: Node Not Appearing in n8n

**Symptoms**: Zoho Bigin node doesn't show up in n8n UI

**Possible Causes**:
1. package.json path incorrect
2. Build didn't run successfully
3. n8n not restarted after installation
4. Cache issues

**Solutions**:
```bash
# Verify file exists
ls -la dist/nodes/ZohoBigin.node.js

# Check package.json syntax
cat package.json | grep -A 10 '"n8n"'

# Rebuild completely
rm -rf dist/ node_modules/.cache
npm run build

# Restart n8n completely (not just reload)
# If using systemd: sudo systemctl restart n8n
# If using pm2: pm2 restart n8n
# If running directly: kill process and restart
```

---

### Issue 2: Build Errors

**Symptoms**: `npm run build` fails with errors

**Common Errors**:

**Error**: `Cannot find module './descriptions'`
**Solution**: Ensure `nodes/descriptions/index.ts` exports all Bigin descriptions

**Error**: `Property 'handlePipelineOperations' does not exist`
**Solution**: Ensure all handler methods are defined in ZohoBigin class

**Error**: `Type 'string' is not assignable to type 'IDataObject'`
**Solution**: Check type assertions in execute method

---

### Issue 3: Icon Not Showing

**Symptoms**: Node appears but shows default icon

**Possible Causes**:
1. zoho.svg not in dist/nodes/
2. Incorrect icon reference in node description

**Solutions**:
```bash
# Check icon exists
ls -la dist/nodes/zoho.svg

# Verify icon reference in ZohoBigin.node.ts
grep "icon:" nodes/ZohoBigin.node.ts
# Should output: icon: 'file:zoho.svg',

# Rebuild
npm run build
```

---

### Issue 4: Type Declaration Issues

**Symptoms**: TypeScript errors in other projects using the package

**Cause**: Missing or incorrect .d.ts files

**Solution**:
```bash
# Verify .d.ts files generated
ls -la dist/nodes/*.d.ts

# Check tsconfig.json has declaration enabled
grep "declaration" tsconfig.json
# Should output: "declaration": true,
```

---

## 💡 Best Practices

### 1. Version Bumping

When ready to publish:

```json
{
  "version": "1.1.0"  // Bump for new feature (Bigin support)
}
```

Follow semantic versioning:
- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features (Bigin is a minor release)
- **Major** (x.0.0): Breaking changes

### 2. Package Files

Ensure only necessary files are published:

```json
{
  "files": [
    "dist"
  ]
}
```

This means:
- ✅ dist/ is included
- ❌ src/, nodes/, credentials/ (TypeScript) are excluded
- ❌ node_modules/ is excluded
- ❌ tests/ are excluded

### 3. Clean Builds

Before publishing, always do a clean build:

```bash
rm -rf dist/ node_modules/.cache
npm ci  # Clean install
npm run build
npm test
npm pack  # Test packaging
```

### 4. Build Scripts

Current scripts are sufficient:

```json
{
  "scripts": {
    "build": "tsc && gulp",
    "watch": "tsc --watch",
    "tslint": "tslint -p tsconfig.json -c tslint.json",
    "test": "jest"
  }
}
```

No changes needed for Bigin node.

---

## 📝 Additional Configuration (Optional)

### Keywords (for npm discoverability)

Consider adding Bigin-related keywords:

```json
{
  "keywords": [
    "n8n",
    "nodemation",
    "zoho",
    "bigin",
    "crm",
    "pipeline",
    "workflow"
  ]
}
```

### Repository and Bugs

Already configured:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vladaman/n8n-nodes-zoho.git"
  },
  "bugs": {
    "url": "https://github.com/vladaman/n8n-nodes-zoho/issues"
  }
}
```

---

## ✅ Completion Checklist

Before moving to Phase 5:

- [ ] package.json updated with ZohoBigin node
- [ ] Clean build successful (`rm -rf dist/ && npm run build`)
- [ ] No TypeScript errors
- [ ] No TSLint warnings
- [ ] ZohoBigin.node.js exists in dist/nodes/
- [ ] Description files compiled to dist/nodes/descriptions/
- [ ] npm pack successful
- [ ] Node appears in n8n after installation
- [ ] Icon displays correctly
- [ ] All resources selectable in UI
- [ ] Ready for testing phase

---

## 🔄 Rollback Plan

If issues arise:

1. **Revert package.json**:
```bash
git checkout package.json
```

2. **Remove compiled files**:
```bash
rm -f dist/nodes/ZohoBigin.node.*
rm -f dist/nodes/descriptions/Bigin*.js
```

3. **Rebuild without Bigin**:
```bash
npm run build
```

4. **Test existing nodes** still work

---

**Previous Phase**: [Phase 3: Main Node Implementation](./phase-3-main-node.md)

**Next Phase**: [Phase 5: Testing & Documentation](./phase-5-testing.md)

**Related Modules**: All modules

**Status**: 📝 Documentation Complete - Ready for Implementation
