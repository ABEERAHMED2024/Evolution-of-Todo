# Evolution of Todo - Frontend

This is the modern, futuristic frontend for the Evolution of Todo project. It features a sleek dark-themed UI with advanced functionality and AI integration.

## Features

- **Modern Dark Theme**: Sleek dark interface with gradient accents
- **Responsive Design**: Works on all device sizes
- **AI Assistant**: Integrated AI-powered task management
- **Real-time Stats**: Dashboard with productivity metrics
- **Advanced Filtering**: Sort and filter tasks by multiple criteria
- **Animated UI**: Smooth transitions and interactive elements
- **Accessibility**: WCAG-compliant design

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: CSS Modules with custom properties
- **Icons**: Feather Icons via inline SVG
- **State Management**: React Hooks
- **API Communication**: Fetch API

## Architecture

```
frontend/
├── pages/                 # Next.js pages
│   ├── index.js          # Main dashboard
│   ├── chat.js           # AI assistant chat
│   └── api/              # Server-side API routes
│       ├── tasks.js      # Task management API
│       └── ai-agent.js   # AI agent proxy
├── components/           # Reusable UI components
│   ├── TaskForm.js       # Task creation form
│   ├── TaskList.js       # Task list display
│   └── TaskItem.js       # Individual task component
├── src/
│   ├── layouts/          # Layout components
│   │   └── MainLayout.js # Main application layout
│   └── components/
│       └── ui/           # Reusable UI components
│           └── futuristic-ui.js
├── styles/               # Global styles
│   └── globals.css
└── public/               # Static assets
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp .env.local.example .env.local
```

3. Update the environment variables as needed

4. Run the development server:
```bash
npm run dev
```

## API Integration

The frontend communicates with the backend services through:

1. **Direct API Routes**: `/api/tasks` and `/api/ai-agent` proxy the backend services
2. **Environment Variables**: API endpoints are configurable via environment variables
3. **Server-Side Rendering**: API routes handle server-side communication to avoid CORS issues

## Design Principles

- **Dark Mode First**: Optimized for low-light environments
- **Gradient Accents**: Modern color scheme with purple/indigo gradients
- **Glass Morphism Effects**: Subtle transparency and blur effects
- **Smooth Animations**: Micro-interactions for better UX
- **Consistent Spacing**: Thoughtful padding and margins
- **Typography Hierarchy**: Clear visual hierarchy with Inter font

## Color Palette

- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple)
- **Accent**: #ec4899 (Pink)
- **Background**: #0f172a (Dark Blue)
- **Surface**: #1e293b (Darker Blue)
- **Text Primary**: #f1f5f9 (Light Gray)
- **Text Secondary**: #cbd5e1 (Medium Gray)

## UI Components

### Futuristic UI Kit
The application includes a custom futuristic UI kit in `src/components/ui/futuristic-ui.js` with:

- FuturisticButton: Gradient buttons with hover effects
- FuturisticCard: Glass-morphism cards
- FuturisticInput: Modern input fields
- FuturisticSelect: Styled select elements
- FuturisticToggle: Modern toggle switches
- FuturisticProgressBar: Animated progress bars
- FuturisticStatCard: Information cards with icons
- FuturisticModal: Modern modal dialogs

### Layout System
The application uses a consistent layout system with:

- Fixed header with navigation
- Collapsible sidebar with stats and quick actions
- Main content area with responsive grid
- Overlay for mobile navigation

## AI Integration

The AI assistant is seamlessly integrated into the UI:

- Natural language processing for task creation
- Context-aware responses
- Conversational interface
- Real-time task management

## Performance Optimizations

- Code splitting for faster loading
- Image optimization
- Efficient state management
- Debounced API calls
- Virtualized lists (future enhancement)

## Accessibility

- Semantic HTML structure
- Proper contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT