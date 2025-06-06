# React Tweet Project Overview

## Project Summary

**react-tweet** is a React library that enables developers to embed Twitter/X tweets in React applications. It supports various React frameworks including Next.js, Create React App, Vite, and more. The library provides both server-side rendering capabilities and client-side components with built-in styling that matches Twitter's official design.

## Project Structure

This is a **monorepo** managed with **pnpm workspaces** and **Turborepo**, containing:

### Core Package
- `packages/react-tweet/` - The main library package

### Example Applications
- `apps/site/` - Documentation website (Next.js with Nextra)
- `apps/next-app/` - Next.js example application
- `apps/vite-app/` - Vite example application
- `apps/create-react-app/` - Create React App example
- `apps/custom-tweet-dub/` - Custom implementation example

### Development Tools
- **Turborepo** for monorepo management and build orchestration
- **pnpm** for package management
- **Changesets** for version management and releases
- **SWC** for fast TypeScript/JavaScript compilation
- **ESLint** for code linting
- **Prettier** for code formatting

## Core Library Architecture

### Entry Points
The library provides multiple entry points:
- **Default export** (`react-tweet`): Server-side rendering components
- **Client export** (`react-tweet/client`): Client-side components with SWR
- **API export** (`react-tweet/api`): Low-level API functions
- **CSS export** (`react-tweet/theme.css`): Default Twitter theme styles

### Key Components

#### Main Components
1. **`Tweet`** - Primary server-side component with Suspense support
2. **`EmbeddedTweet`** - Core tweet rendering component
3. **`TweetSkeleton`** - Loading placeholder component
4. **`TweetNotFound`** - Error/not found component

#### UI Components (Twitter Theme)
- **`TweetContainer`** - Main wrapper component
- **`TweetHeader`** - User info, avatar, verification badge
- **`TweetBody`** - Tweet text with entity parsing
- **`TweetMedia`** - Images, videos, GIFs
- **`TweetActions`** - Like, reply, retweet buttons
- **`TweetInfo`** - Timestamp and source info
- **`TweetReplies`** - Reply thread info
- **`QuotedTweet`** - Embedded quoted tweets
- **`TweetInReplyTo`** - Reply context indicator

### Data Flow

#### Tweet Fetching Process
1. **ID Validation** - Validates tweet ID format (numeric, max 40 chars)
2. **Token Generation** - Generates API token using mathematical formula
3. **API Request** - Fetches from Twitter's syndication API (`cdn.syndication.twimg.com`)
4. **Response Processing** - Handles tombstones, not found, and errors
5. **Data Enrichment** - Adds URLs, processes entities, formats data

#### Tweet Data Structure
```typescript
interface Tweet {
  __typename: 'Tweet'
  id_str: string
  text: string
  created_at: string
  user: TweetUser
  entities: TweetEntities
  favorite_count: number
  conversation_count: number
  mediaDetails?: MediaDetails[]
  quoted_tweet?: QuotedTweet
  // ... more fields
}
```

### Key Features

#### 1. Server-Side Rendering (SSR)
- Async components for Next.js App Router
- Suspense boundaries for loading states
- React 18+ compatibility

#### 2. Client-Side Rendering
- SWR integration for data fetching
- Automatic revalidation and caching
- Error boundary handling

#### 3. Media Support
- **Images**: Multiple image layouts, responsive sizing
- **Videos**: MP4 video playback with controls
- **GIFs**: Animated GIF support
- **Adaptive Quality**: Automatic quality selection for videos

#### 4. Text Processing
- **Entity Parsing**: Hashtags, mentions, URLs, symbols
- **Link Generation**: Automatic URL generation for all entities
- **Text Formatting**: Proper text rendering with entities
- **Unicode Support**: Full Unicode text support

#### 5. Theming System
- **CSS Modules**: Scoped component styles
- **Custom Components**: Override any component
- **Theme CSS**: Single CSS file import
- **Dark Mode**: Built-in dark mode support

#### 6. Accessibility
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility

### API Layer

#### Core Functions
- **`getTweet(id, options?)`** - High-level tweet fetching
- **`fetchTweet(id, options?)`** - Low-level API access
- **`getOEmbed(url)`** - oEmbed API integration

#### Error Handling
- **`TwitterApiError`** - Custom error class with status codes
- **Tombstone Detection** - Handles deleted/restricted tweets
- **404 Handling** - Graceful handling of missing tweets

#### Caching & Performance
- **Built-in Caching** - SWR-based caching for client-side
- **Request Deduplication** - Prevents duplicate API calls
- **Custom Fetch Options** - Configurable request parameters

### Styling System

#### CSS Architecture
- **CSS Modules** for component-level styling
- **BEM-like Naming** for consistent class names
- **CSS Custom Properties** for theming
- **Responsive Design** built-in

#### Twitter Theme Features
- **Pixel-perfect Styling** matching Twitter's design
- **Responsive Layout** for all screen sizes
- **Interactive States** (hover, focus, active)
- **Animation Support** for smooth transitions

### Development & Release

#### Build Process
- **SWC Compilation** for fast TypeScript transpilation
- **Type Generation** with TypeScript compiler
- **CSS Processing** with PostCSS
- **Bundle Optimization** for multiple output formats

#### Quality Assurance
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Changesets** for release management

#### CI/CD Pipeline
- **GitHub Actions** for automated testing and deployment
- **Automated Releases** with changesets
- **Multi-package Publishing** to npm

## Usage Patterns

### Basic Usage (Server-Side)
```tsx
import { Tweet } from 'react-tweet'

export default function Page() {
  return <Tweet id="1629307668568633344" />
}
```

### Client-Side with SWR
```tsx
import { Tweet } from 'react-tweet'

export default function ClientTweet() {
  return (
    <Tweet 
      id="1629307668568633344" 
      apiUrl="/api/tweet"
    />
  )
}
```

### Custom Components
```tsx
import { EmbeddedTweet, TweetSkeleton } from 'react-tweet'

const customComponents = {
  TweetSkeleton: CustomSkeleton,
  AvatarImg: CustomAvatar,
}

<Tweet id="123" components={customComponents} />
```

### API Integration
```tsx
import { getTweet } from 'react-tweet/api'

export async function getStaticProps() {
  const tweet = await getTweet('1629307668568633344')
  return { props: { tweet } }
}
```

## Dependencies

### Core Dependencies
- **React** 18+ (peer dependency)
- **SWR** for client-side data fetching
- **clsx** for conditional class names

### Build Dependencies
- **SWC** for compilation
- **TypeScript** for type checking
- **Turbo** for monorepo management

### Zero Runtime Dependencies
- No external styling dependencies
- No heavy third-party libraries
- Minimal bundle size impact

## Browser Support

- **Modern Browsers**: Full support for ES2020+ features
- **React 18+**: Leverages latest React features
- **Server-Side Rendering**: Works in all SSR environments
- **Progressive Enhancement**: Graceful degradation for older browsers

## Contributing

The project follows standard open-source practices:
- **GitHub Issues** for bug reports and feature requests
- **Pull Requests** with comprehensive testing
- **Changesets** for version management
- **Documentation** via Nextra-based website

## Future Considerations

Based on the changelog and project structure, potential areas for enhancement:
- **More Social Platforms**: Extending beyond Twitter/X
- **Advanced Theming**: More customization options
- **Performance Optimization**: Further bundle size reduction
- **Accessibility Improvements**: Enhanced screen reader support
- **Mobile Optimization**: Better touch interactions 