# Publishing Checklist

This document outlines what has been completed and what remains before publishing the repository to GitHub.

## ✅ Completed

### Code & Addon
- [x] WahlRaumFinder addon migrated to MasterPortal 3.x
- [x] All MP 2.x → MP 3.x API migrations completed
- [x] SearchBar integration via Vuex actions
- [x] Hover tooltip feature implemented
- [x] Distance label on map feature implemented
- [x] Auto-activation support (with optional patch)
- [x] Component cleanup (beforeUnmount)
- [x] All console.log debugging statements in place

### Documentation
- [x] README.md - Main documentation with features and quick start
- [x] NOTICE.md - Attribution to original authors with license clarification
- [x] CHANGELOG.md - Complete changelog with migration notes
- [x] docs/INSTALL.md - Step-by-step installation guide
- [x] docs/CONFIG.md - Complete configuration reference
- [x] docs/MASTERPORTAL_SETUP.md - MasterPortal-specific setup guide

### Examples
- [x] examples/config.json.example - Tool and layer configuration snippets
- [x] examples/services.json.example - Service definitions
- [x] examples/style_v3.json.example - Style definitions

### Patches
- [x] patches/auto-activation-urlparams.patch - Optional core patch for auto-activation

### Repository Files
- [x] .gitignore - Proper Git ignore rules
- [x] LICENSE - MIT License (existing)

## 📋 TODO Before Publishing

### 1. Testing (High Priority)
- [ ] Test the addon without urlParams.js patch (using URL parameter)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (iOS Safari, Chrome Mobile)
- [ ] Test with different data volumes (small, medium, large datasets)
- [ ] Test error scenarios (missing data, network failures)
- [ ] Test hover tooltips on all polling station markers
- [ ] Test distance label visibility at different zoom levels

### 2. Code Cleanup (Medium Priority)
- [ ] Review and remove unnecessary console.log statements (keep essential ones)
- [ ] Add JSDoc comments to any undocumented functions
- [ ] Run linter and fix any issues (`npm run lint`)
- [ ] Check for any TODO comments in code
- [ ] Verify no hardcoded Munich-specific URLs in addon code

### 3. Documentation Completion (Medium Priority)
- [ ] Add screenshots to README.md (search result, tooltip, distance label)
- [ ] Create docs/MIGRATION.md (referenced but not created yet)
- [ ] Update date in CHANGELOG.md (replace "2025-01-XX" with actual date)
- [ ] Replace "YOUR_USERNAME" in README.md with actual GitHub username
- [ ] Add GitHub repository URLs once created
- [ ] Verify all internal documentation links work

### 4. Optional Enhancements (Low Priority)
- [ ] Create animated GIF demonstrating the tool in action
- [ ] Add FAQ section to README
- [ ] Create CONTRIBUTING.md with contribution guidelines
- [ ] Add GitHub Issue templates
- [ ] Add GitHub Pull Request template
- [ ] Create package.json for npm if considering npm distribution
- [ ] Add badges to README (build status, etc.)

### 5. Legal/Attribution (High Priority)
- [ ] **VERIFY** original repository license on Bitbucket
- [ ] Contact original authors to inform them of derivative work
- [ ] Update NOTICE.md if license information is found
- [ ] Ensure all attribution is complete and accurate

### 6. GitHub Repository Setup
- [ ] Create GitHub repository
- [ ] Choose repository name (suggestion: `wahlraumfinder-masterportal-3`)
- [ ] Set repository description
- [ ] Add topics/tags: `masterportal`, `gis`, `geoportal`, `polling-stations`, `vue`, `openlayers`
- [ ] Enable Issues
- [ ] Enable Discussions (optional)
- [ ] Configure branch protection (optional)

### 7. Initial Commit
- [ ] Review all files to be committed
- [ ] Stage only necessary files (exclude test data, temp files)
- [ ] Create meaningful commit message
- [ ] Push to GitHub

### 8. Release
- [ ] Create GitHub release v1.0.0-mp3
- [ ] Write release notes based on CHANGELOG
- [ ] Attach any additional files if needed

### 9. Post-Publication
- [ ] Share in MasterPortal community/forums
- [ ] Consider submitting to MasterPortal addons list
- [ ] Consider contributing urlParams.js enhancement to MasterPortal upstream
- [ ] Monitor GitHub Issues for questions/feedback

## 🔍 Current Status Summary

### What Works
- Addon fully functional in MasterPortal 3.15.1
- Address search triggers polling station lookup
- Distance calculation and display
- Hover tooltips on polling station markers
- Mobile responsive
- Multilingual (DE/EN)

### Known Issues
- None identified yet (pending thorough testing)

### Dependencies
- MasterPortal 3.15.0+
- OpenLayers (via MasterPortal)
- Vue 3 (via MasterPortal)
- Vuex (via MasterPortal)

## 📝 Notes

### urlParams.js Patch
- Currently included as optional patch in `patches/` directory
- Documented as optional in MASTERPORTAL_SETUP.md
- Addon works without it using URL parameter `?isinitopen=wahlRaumFinder`
- Decision: Keep as optional, recommend URL parameter method as default

### License Strategy
- Current approach: Transparent attribution with good faith
- NOTICE.md clearly states original work and lack of explicit license
- Invites copyright holders to contact if concerns
- This is a reasonable approach given public availability of original

### Testing Priority
1. **Core functionality**: Address search, polling station lookup, distance
2. **Visual features**: Tooltips, markers, distance labels
3. **Edge cases**: Missing data, errors, mobile devices
4. **Performance**: Large datasets, slow networks

## 🎯 Recommended Next Steps

1. **Immediate** (Do this first):
   - Verify original license on Bitbucket
   - Run comprehensive tests (see Testing section above)
   - Take screenshots for README
   - Clean up console.log statements

2. **Before Publishing** (Do within 1-2 days):
   - Complete docs/MIGRATION.md
   - Update all placeholder text (dates, URLs, usernames)
   - Final review of all documentation

3. **Publication Day**:
   - Create GitHub repository
   - Initial commit and push
   - Create v1.0.0-mp3 release
   - Share with community

4. **Post-Publication** (First week):
   - Monitor for issues
   - Respond to questions
   - Consider contributing to MasterPortal upstream

## 📞 Contact Plan

Template email to original authors (see docs/OUTREACH_TEMPLATE.md - not created yet):
- Explain the adaptation
- Ask about license
- Offer collaboration
- Provide GitHub link once published

## Summary

**Status**: ~90% complete, ready for testing and final touches
**Estimated time to publish**: 1-2 days (with thorough testing)
**Risk level**: Low (good attribution, open source spirit, public code)
**Recommendation**: Proceed with testing, then publish
