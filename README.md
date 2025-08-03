# Be Visible - AI-Powered Social Media Content Generator

A Chrome extension that uses AI to generate engaging comments, DM suggestions, and create posts for social media platforms like LinkedIn, X (Twitter), and Farcaster.

## 🚀 Features

- **AI-Powered Comments**: Generate contextual comments using OpenAI's GPT models
- **AI-Powered Post Creation**: Create engaging posts with custom tones and platform-specific lengths
- **Multiple Tones**: Choose from 13 different comment tones and 7 post tones (Friendly, Professional, Contrarian, etc.)
- **Custom Tones**: Create your own custom tones with custom names, emojis, prompts, and guidelines for both comments and posts
- **DM Suggestions**: Get personalized direct message suggestions
- **Comment Improvement**: Improve your own comments with AI assistance
- **Multi-Platform Support**: Works on LinkedIn, X (Twitter), Farcaster, and extensible for other platforms
- **Customizable Prompts**: Advanced settings to customize AI behavior for each tone
- **Export/Import Settings**: Backup and restore your custom configurations including custom tones
- **Magical Loading Animations**: Engaging animations during AI processing
- **Text Box Preview**: Copy-friendly text area for generated content

## 📁 File Structure

```
be-visible/
├── 📄 manifest.json              # Extension manifest and permissions
├── 📄 contentScript.js           # Main orchestrator script
├── 📄 aiService.js               # AI operations and API handling
├── 📄 modalManager.js            # Modal UI management and rendering
├── 📄 cssManager.js              # Dynamic CSS management
├── 📄 platformManager.js         # Platform detection and management
├── 📄 storage.js                 # Storage utilities
├── 📄 background.js              # Background service worker
├── 📄 popup.html                 # Extension popup interface
├── 📄 popup.js                   # Popup functionality
├── 📄 settings.html              # Settings page interface
├── 📄 settings.js                # Settings page functionality
├── 📄 create.html                # Post creation page interface
├── 📄 create.js                  # Post creation functionality
├── 📄 general-settings.html      # General settings page interface
├── 📄 general-settings.js        # General settings functionality
├── 📄 welcome.html               # Welcome page
├── 📄 welcome.js                 # Welcome page functionality
├── 📄 guide.html                 # User guide page
├── 📄 modal.css                  # Modal-specific styles
├── 📄 icon.png                   # Extension icon
├── 📄 icon.svg                   # Extension icon source
├── 📁 platforms/                 # Platform-specific implementations
│   ├── 📄 basePlatform.js        # Base platform interface
│   ├── 📄 linkedin.js            # LinkedIn-specific logic
│   ├── 📄 x.js                   # X (Twitter) specific logic
│   └── 📄 farcaster.js           # Farcaster-specific logic
└── 📁 styles/                    # Platform-specific CSS
    ├── 📄 base.css               # Base styles for all platforms
    ├── 📄 linkedin.css           # LinkedIn-specific styles
    └── 📄 x.css                  # X (Twitter) specific styles
```

## 🏗️ Architecture Overview

### Core Services

#### 1. **contentScript.js** - Main Orchestrator

- **Purpose**: Coordinates all services and manages the extension lifecycle
- **Responsibilities**:
  - Initialize all services (AI, Modal, Platform, CSS managers)
  - Handle button injection under posts
  - Manage extension context and error handling
  - Coordinate between different services

#### 2. **aiService.js** - AI Operations

- **Purpose**: Handles all AI-related operations
- **Responsibilities**:
  - OpenAI API communication
  - Prompt generation and management
  - Response parsing and cleaning
  - Comment and DM formatting
  - Model selection and fallback handling

#### 3. **modalManager.js** - UI Management

- **Purpose**: Manages the modal interface and user interactions
- **Responsibilities**:
  - Modal creation and positioning (bottom-right corner)
  - Comment and DM rendering
  - Copy button functionality
  - Drag and drop functionality
  - Event handling for tone changes and improvements

#### 4. **cssManager.js** - Dynamic Styling

- **Purpose**: Manages platform-specific CSS injection
- **Responsibilities**:
  - Inject base CSS for all platforms
  - Inject platform-specific CSS
  - Manage CSS conflicts with host pages
  - Ensure consistent styling across platforms

#### 5. **platformManager.js** - Platform Detection

- **Purpose**: Detects current platform and delegates operations
- **Responsibilities**:
  - Platform detection (LinkedIn, X, etc.)
  - Route operations to appropriate platform implementation
  - Fallback handling for unsupported platforms

### Platform-Specific Architecture

#### Base Platform Interface (`platforms/basePlatform.js`)

```javascript
class BasePlatform {
  getPlatformName() {
    /* returns platform name */
  }
  findPosts() {
    /* finds posts on the page */
  }
  findActionButton(post) {
    /* finds comment/reply buttons */
  }
  createActionButton() {
    /* creates extension button */
  }
  injectButton(post, button) {
    /* injects button into post */
  }
  extractPostText(post) {
    /* extracts post content */
  }
  extractAuthorName(post) {
    /* extracts author name */
  }
  extractUserProfileName() {
    /* extracts user's profile name */
  }
  getDefaultPrompts() {
    /* returns platform-specific prompts */
  }
  getDefaultGuidelines() {
    /* returns platform-specific guidelines */
  }
  formatComment(comment, authorName) {
    /* formats comment for platform */
  }
  formatDM(dm, authorName, userProfileName) {
    /* formats DM for platform */
  }
}
```

#### LinkedIn Implementation (`platforms/linkedin.js`)

- **Post Detection**: Uses LinkedIn-specific selectors
- **Button Injection**: Injects next to LinkedIn comment buttons
- **Text Extraction**: Handles LinkedIn's post structure
- **Name Extraction**: Extracts names from LinkedIn's author elements
- **Styling**: LinkedIn-specific button and modal styling

#### X (Twitter) Implementation (`platforms/x.js`)

- **Post Detection**: Uses X-specific selectors
- **Button Injection**: Injects next to X reply buttons
- **Text Extraction**: Handles X's tweet structure
- **Name Extraction**: Extracts names from X's user elements
- **Styling**: X-specific button and modal styling

#### Farcaster Implementation (`platforms/farcaster.js`)

- **Post Detection**: Uses Farcaster-specific selectors for casts
- **Button Injection**: Injects next to Farcaster reply buttons
- **Text Extraction**: Handles Farcaster's cast structure
- **Name Extraction**: Extracts names from Farcaster's user elements
- **Styling**: Farcaster-specific button and modal styling with purple theme

### CSS Architecture

#### Base CSS (`styles/base.css`)

- Common styles for all platforms
- Modal positioning and basic styling
- Button styling and interactions
- Form elements styling

#### Platform-Specific CSS

- **LinkedIn CSS**: LinkedIn-specific button positioning and styling
- **X CSS**: X-specific button positioning and styling
- **Farcaster CSS**: Farcaster-specific button positioning and styling with purple theme
- **Modal CSS**: Modal-specific styling with platform considerations

## 🎯 Key Features Explained

### 1. **Multi-Platform Support**

The extension uses a platform-agnostic architecture:

- **Detection**: Automatically detects the current platform
- **Delegation**: Routes operations to platform-specific implementations
- **Fallback**: Graceful fallback for unsupported platforms

### 2. **AI Integration**

- **Separate API Calls**: Comments and DMs are generated with separate API calls
- **Prompt Engineering**: Platform-specific prompts and guidelines
- **Response Parsing**: Robust parsing to handle various AI response formats
- **Error Handling**: Comprehensive error handling and fallbacks

### 3. **User Interface**

- **Modal Positioning**: Appears in bottom-right corner
- **Drag & Drop**: Users can drag the modal around
- **Copy Functionality**: One-click copy for comments and DMs
- **Tone Selection**: Dropdown to change comment tone
- **Comment Improvement**: AI-powered comment enhancement

### 4. **Settings & Customization**

- **API Key Management**: Secure storage of OpenAI API key
- **Tone Customization**: Customize prompts and guidelines for each tone
- **Export/Import**: Backup and restore settings
- **Model Selection**: Choose between different GPT models

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd be-visible
   ```

2. **Load in Chrome**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

3. **Configure API Key**

   - Click the extension icon
   - Go to Settings
   - Enter your OpenAI API key
   - Save the settings

4. **Start Using**
   - Navigate to LinkedIn, X, or Farcaster
   - Look for "📝✨" buttons under posts
   - Click to generate AI-powered comments and DMs
   - Use "📝 Create Post" button in popup for post creation

## 🎨 Customization

### Adding New Platforms

1. Create a new platform file in `platforms/` directory
2. Extend the `BasePlatform` class
3. Implement platform-specific methods
4. Add platform detection in `platformManager.js`
5. Create platform-specific CSS in `styles/` directory

### Customizing AI Behavior

1. Go to Settings in the extension
2. Modify prompts and guidelines for each tone
3. Export settings for backup
4. Import settings on other installations

### Creating Custom Tones

1. Go to Settings in the extension
2. Scroll down to "✨ Create Custom Tones" section
3. Fill in the form:
   - **Tone Name**: Choose a unique name for your tone
   - **Emoji**: Pick an emoji to represent your tone
   - **Prompt Text**: Write instructions for the AI
   - **Guideline Text**: Define specific guidelines for the tone
4. Click "✨ Create Tone" to save
5. Your custom tone will appear in the dropdown when generating comments
6. Custom tones are included in export/import functionality

**Example Custom Tone:**

- **Name**: "Professional Networking"
- **Emoji**: "🤝"
- **Prompt**: "Write 2 professional networking comments that help build connections and offer value to the author's network."
- **Guideline**: "- Start with the author's name\n- Offer specific insights or resources\n- Keep tone professional and helpful\n- Focus on relationship building"

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally in your browser
- **No Data Collection**: No user data is sent to external servers
- **API Key Security**: API key is only used for OpenAI API calls
- **No Tracking**: No analytics or tracking code

## 📋 Recent Changes

### Version 1.0 - Complete Feature Set & Platform Support

#### 🚀 **Post Creation Feature**

- **Create Post Page**: Dedicated page for AI-powered post creation with vertical navigation
- **Multi-Platform Support**: Create posts for LinkedIn, X (Twitter), and Farcaster
- **Custom Post Tones**: 7 default post tones + unlimited custom post tones
- **Platform-Specific Lengths**: Short, Medium, Long options with platform-appropriate character limits
- **AI Model Selection**: Choose between GPT-3.5-turbo, GPT-4, and GPT-4o
- **Text Box Preview**: Copy-friendly textarea for generated posts with character count
- **Magical Loading Animation**: Engaging "Crafting..." animation with pencil, sparkles, and typing effect

#### 🎨 **Enhanced User Experience**

- **Vertical Navigation**: Sidebar with "Create Post", "Tone Setup", and "Settings" tabs
- **Tone Management**: Full tone setup interface for post creation (mirrors comment tones)
- **Emoji Picker**: Searchable emoji picker for custom post tones
- **Bulk Actions**: Save All/Reset All functionality for post tones
- **Export/Import**: Post tones included in settings backup/restore
- **Responsive Design**: Mobile-friendly post creation interface

#### 🔧 **Technical Improvements**

- **Separate Storage**: Post tones stored separately from comment tones (`postTonePrompts`, `postToneGuidelines`, `customPostTones`)
- **Animation System**: CSS animations with JavaScript restart for reliable loading states
- **Platform Length Configs**: Dynamic character limits based on platform and length selection
- **Error Handling**: Improved error handling for post generation
- **Performance**: Optimized animation rendering and DOM updates

#### 🎯 **Custom Tones Feature**

- **Custom Tone Creation**: Users can create their own tones with custom names, emojis, prompts, and guidelines
- **Emoji Picker**: Modern, searchable emoji picker with categories and recent emojis
- **Tabbed Settings**: Reorganized settings into "General", "Tones", and "Add Tone" tabs
- **Export/Import**: Custom tones are included in settings backup/restore
- **Grid Layout**: Custom tones displayed in organized 3-column grid

#### 🧠 **AI Improvements**

- **Custom Tone Integration**: AI now uses custom tones in addition to default tones
- **Two Comment Generation**: Ensured all tones (including custom) generate exactly 2 comments
- **Prompt Enhancement**: Automatic enhancement of custom prompts to request 2 comments
- **Variable Cleaning**: Improved cleaning of literal variable placeholders in AI responses

#### 🎨 **Settings UI Overhaul**

- **Tabbed Interface**: Clean separation of API key, tone management, and custom tone creation
- **Bulk Actions**: "Save All Tones" and "Reset All to Default" buttons
- **Individual Controls**: Save/Reset buttons for each individual tone
- **Improved Export/Import**: Better file handling and UI for settings backup
- **Responsive Design**: Mobile-friendly settings interface

#### 🔧 **Technical Improvements**

- **CSS Scoping**: Platform-specific CSS to prevent conflicts between platforms
- **Event Delegation**: Improved emoji picker and tone card interactions
- **Error Handling**: Better error handling for custom tone operations
- **Performance**: Optimized button injection and modal rendering

#### 🎨 **Branding & Visual Updates**

- **Extension Name**: "Be Visible" - professional and memorable branding
- **Icon Update**: Purple icon with magic emoji (✨) for modern look
- **Button Text**: Changed to "📝✨" for subtle and professional appearance
- **Modal Header**: Added "🎯 Be Visible" heading with subtitle
- **Color Scheme**: Unified purple theme (`rgb(139, 92, 246)`) across all UI elements

#### 🔧 **Button Design & Positioning**

- **LinkedIn**: Button positioned above comment button, centered
- **X (Twitter)**: Maintained existing positioning with updated design
- **Farcaster**: Maintained existing positioning with updated design
- **Button Size**: Reduced padding and made buttons more compact
- **Border Style**: Added consistent purple border across all platforms
- **Shape**: Changed to square/rectangular design for modern look

#### 🌐 **Multi-Platform Support**

- **LinkedIn**: Full support for LinkedIn posts and comments
- **X (Twitter)**: Complete integration with X's interface
- **Farcaster**: Full support for Farcaster casts and replies
- **Platform Detection**: Automatic detection and appropriate styling
- **Character Limits**: Platform-specific character limits and formatting

## 🐛 Troubleshooting

### Common Issues

1. **Buttons not appearing**: Check if the platform is supported
2. **API errors**: Verify your OpenAI API key and credits
3. **Styling issues**: Check if CSS is being injected properly
4. **Modal not working**: Check browser console for errors

### Debug Mode

Enable debug logging by checking the browser console for detailed logs.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section
- Review the browser console for errors
- Create an issue in the repository

---

**Built with ❤️ for better social media engagement**
