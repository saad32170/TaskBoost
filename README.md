# TaskBoost

Convert your scribbles or handwritten to-do's into a digital to-do list.

## Overview

TaskBoost is an intelligent productivity web application that transforms handwritten notes and voice recordings into structured digital tasks using AI-powered OCR and transcription technologies. Whether you prefer jotting down notes on paper or speaking your thoughts aloud, TaskBoost bridges the gap between analog capture and digital organization.

## Key Features

### 📸 Image Scanning
- **Handwriting Recognition**: Upload photos of handwritten notes, whiteboards, or sticky notes
- **AI Text Extraction**: Advanced OCR technology extracts text with high accuracy
- **Smart Task Detection**: Automatically identifies actionable items from unstructured notes
- **Multiple Formats**: Supports JPG, PNG, and JPEG image formats

### 🎤 Voice Recording
- **Speech-to-Text**: Record voice memos and convert them to structured tasks
- **Real-time Processing**: Live recording with instant AI transcription
- **Natural Language Understanding**: Interprets spoken tasks, priorities, and deadlines
- **Hands-free Capture**: Perfect for capturing ideas on the go

### 🤖 AI-Powered Organization
- **Automatic Task Structuring**: Extracts clear, actionable tasks from raw input
- **Priority Detection**: Intelligently assigns priority levels (low, medium, high)
- **Deadline Suggestions**: Proposes realistic deadlines based on context
- **Effort Estimation**: Estimates time required to complete tasks

### ✏️ Task Management
- **Edit Before Saving**: Review and modify extracted tasks before adding to your list
- **Custom Descriptions**: Add detailed descriptions to provide more context
- **Flexible Organization**: Adjust priorities, deadlines, and time estimates
- **Progress Tracking**: Monitor completed tasks and productivity statistics

### 📱 Mobile-First Design
- **Responsive Interface**: Optimized for mobile devices and tablets
- **Touch-Friendly**: Large buttons and intuitive navigation
- **Camera Integration**: Direct access to device camera for instant capture
- **Offline-Ready**: Service worker support for reliable performance

## Technology Stack

### Frontend
- **React 18** with TypeScript for robust component development
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient data fetching and caching
- **Tailwind CSS** with shadcn/ui components for modern styling
- **Vite** for fast development and optimized builds

### Backend
- **Node.js** with Express.js for API endpoints
- **TypeScript** for type-safe server development
- **OpenAI GPT-4o-mini** for text structuring and task extraction
- **OpenAI 4o-mini-transcribe** for high-quality speech transcription
- **Multer** for secure file upload handling

### Database
- **PostgreSQL** for reliable data persistence
- **Drizzle ORM** for type-safe database operations
- **Session Management** with connect-pg-simple

### Authentication
- **Replit Auth** with OpenID Connect integration
- **Secure Sessions** with encrypted storage
- **User Isolation** ensuring data privacy

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taskboost.git
cd taskboost
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example environment file
cp .env.example .env

# Add your configuration
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Scanning Handwritten Notes

1. Click the **"Scan Notes"** button from the home screen
2. Take a photo of your handwritten notes or upload an existing image
3. Wait for AI processing to extract text and identify tasks
4. Review and edit the extracted tasks as needed
5. Save all tasks to your digital to-do list

### Recording Voice Memos

1. Click the **"Voice Record"** button from the home screen
2. Tap **"Start Recording"** and speak your tasks clearly
3. Tap **"Stop Recording"** when finished
4. Review the transcribed tasks and make any adjustments
5. Save the tasks to your list

### Managing Tasks

- **View Tasks**: Switch between "All Tasks" and "This Week" views
- **Edit Tasks**: Click the edit icon to modify title, description, priority, or deadline
- **Complete Tasks**: Mark tasks as done to track your progress
- **Delete Tasks**: Remove tasks that are no longer relevant

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user information
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Log out current user

### Task Management
- `GET /api/tasks` - Retrieve user's tasks
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/complete` - Mark task as completed

### AI Processing
- `POST /api/scan-image` - Extract tasks from uploaded image
- `POST /api/voice-to-tasks` - Convert audio recording to tasks

### Analytics
- `GET /api/stats` - Get user productivity statistics

## Contributing

We welcome contributions to TaskBoost! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Ensure mobile responsiveness
- Optimize for performance
- Maintain accessibility standards


## Support

If you encounter any issues or have questions, please drop me an email at saad32170@gmail.com

### Long-term Vision
- **Multi-language Support**: Handwriting recognition in multiple languages
- **Integration Hub**: Connect with popular productivity tools
- **Dark Mode**: Full dark theme support
- **Task Categories**: Organize tasks by project or context
- **Collaboration**: Share tasks with team members
- **Calendar Integration**: Sync with external calendar applications
- **Smart Notifications**: Deadline reminders and progress alerts
- **Export Options**: PDF and CSV export functionality
- **Convert to App**
