# LOKEY-AI

LOKEY-AI is a full-stack AI-powered personal development mentor and coach for students. It helps users grow academically, personally, and professionally through personalized guidance, daily planning, and document analysis.

## Features

- **AI Chat Mentor:** Empathetic and supportive AI that understands your behavior and language.
- **Behavior Detection:** Detects if you're feeling lazy, stressed, confused, or motivated.
- **Daily AI Planning:** Generates a custom daily schedule based on your goals and history.
- **File Analysis:** Upload PDF or DOCX files for AI-powered summarization.
- **Voice Input:** Talk to your mentor using built-in voice recognition.
- **Smart Memory:** Remembers past conversations to provide consistent mentorship.
- **Dashboard:** Track your goals, daily plan, and recent memories.
- **Admin Center:** Oversight of system messages and user interactions.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Motion.
- **Backend:** Node.js, Express, Multer, PDF-Parse, Mammoth.
- **Database:** Supabase (Auth, Firestore-like tables).
- **AI:** Google Gemini API.

## Setup

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a `.env` file based on `.env.example` and fill in your Supabase and Gemini API keys.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  **Build for production:**
    ```bash
    npm run build
    ```

## Deployment

- **Frontend:** Deploy to Vercel.
- **Backend:** Deploy to Render.
- Set the `VITE_API_URL` on the frontend to point to your backend service.

## License

MIT
