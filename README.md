# MediBlink - Healthcare in a Blink 🏥

MediBlink is a modern, AI-powered appointment management system designed to connect patients with top-rated specialists instantly. It features a seamless booking experience, an intelligent AI health assistant for triage, and a patient dashboard for managing health records.


## ✨ Key Features

-   **Find Specialists**: Browse profiles of verified doctors across various specialties (Cardiology, Dermatology, Pediatrics, etc.).
-   **AI Health Assistant**: Powered by **Google Gemini**, our AI analyzes symptoms and recommends relevant specialists in real-time.
-   **Instant Booking**: Schedule video consultations or in-person visits with a few clicks.
-   **Patient Dashboard**: Track upcoming appointments and view active prescriptions.
-   **Responsive Design**: optimized for mobile and desktop using **Tailwind CSS**.

## 🚀 Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **AI Integration**: [Google Generative AI SDK](https://github.com/google/generative-ai-js) (Gemini Models)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State Management**: React Hooks & Local Storage (Prototype)

## 🛠️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js 18+ installed.
-   A Google AI Studio API Key (for the AI features).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mediblink.git
    cd mediblink
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your Google Gemini API Key:
    ```env
    API_KEY=your_google_ai_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚠️ Current Status & Limitations (Prototype)

This application is currently a **Proof of Concept (PoC)** and has the following limitations:

-   **Authentication**: Uses local storage simulation. **Do not use real passwords.**
-   **Data Persistence**: All appointments and user data are stored in the browser's Local Storage. Clearing cache will delete data.
-   **Server Actions**: The project uses Next.js Server Actions for AI requests. It requires a Node.js environment (not a static export).

## 🔮 Future Roadmap

-   [ ] Migrate authentication to NextAuth.js or Clerk.
-   [ ] Connect to a real database (PostgreSQL/Mongodb).
-   [ ] Implement real-time video calling (WebRTC).
-   [ ] Refactor monolithic `page.tsx` into clearer sub-routes.
-   [ ] Add Doctor Dashboard for managing availability.

## 📄 License

This project is licensed under the MIT License.
