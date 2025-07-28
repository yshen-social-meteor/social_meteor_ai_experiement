# Split - Bill Splitting App

A beautiful, production-ready bill splitting app built with Expo and React Native.

## Development Setup

### Option 1: Expo Go (Requires Dev Server)
```bash
npm run dev
```
- Scan QR code with Expo Go
- Keep terminal running (you can close browser tab)
- App works as long as terminal process is active

### Option 2: Development Build (Independent App)

1. **Install EAS CLI globally:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Build development version:**

For iOS:
```bash
npm run build:ios
```

For Android:
```bash
npm run build:android
```

4. **Install the custom app** on your device from the build link
5. **Your app now works independently** without needing the dev server

### Option 3: Quick Fix for Current Setup

1. Run `npm run dev` in terminal
2. Scan QR code with Expo Go  
3. Close browser tab (keep terminal open)
4. App continues working on your phone

## Features

- **Beautiful UI**: Production-ready design with smooth animations
- **Multiple Split Methods**: Split by item, evenly, or by percentage
- **Interactive Pie Chart**: Visual percentage splitting with SVG
- **Payment Integration**: Multiple payment options (Venmo, PayPal, etc.)
- **Real-time Updates**: Live calculation updates
- **Responsive Design**: Works on all screen sizes

## Project Structure

```
app/
├── _layout.tsx              # Root layout
├── (tabs)/                  # Tab navigation
│   ├── _layout.tsx         # Tab configuration
│   ├── index.tsx           # Receipts screen
│   ├── friends.tsx         # Friends & Groups
│   └── history.tsx         # Transaction history
├── receipt/                # Receipt management
│   ├── [id].tsx           # Receipt details
│   ├── manual.tsx         # Manual entry
│   ├── camera.tsx         # Camera scanning
│   └── create.tsx         # Creation options
components/                 # Reusable components
├── EmptyState.tsx
├── FloatingActionButton.tsx
├── SearchBar.tsx
└── TransactionCard.tsx
```

## Technologies Used

- **Expo SDK 52** - React Native framework
- **Expo Router** - File-based navigation
- **React Native SVG** - Interactive charts
- **Expo Camera** - Receipt scanning
- **TypeScript** - Type safety
- **Supabase** - Backend database

## Database Schema

The app uses Supabase with the following tables:
- `receipts` - Receipt information
- `receipt_items` - Individual items
- `receipt_participants` - People involved
- `receipt_item_participants` - Item assignments

## Development Notes

- Default platform is Web (some native APIs unavailable)
- Uses tab-based navigation as primary structure
- Follows Expo managed workflow
- No native code directories (ios/android)