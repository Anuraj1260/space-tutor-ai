# 🚀 AI Space Tutor: Real-Time Interaction

An interactive educational web app where an AI "Space Captain" teaches a child about the solar system. The AI initiates a voice conversation, listens to the child's responses in real-time, and provides visual rewards (confetti) for correct answers.

## 🌟 Key Features

* **🗣️ Real-Time Voice Interaction:** Uses the browser's native Web Speech API for low-latency speech recognition and synthesis.
* **🧠 Intelligent AI:** Powered by **Google Gemini 1.5 Flash** to generate context-aware, child-friendly responses.
* **⏱️ 1-Minute Micro-Lesson:** Automatically manages a 60-second focused learning session with a countdown timer.
* **🎉 Visual Feedback:** Triggers a "Tool Call" (Confetti explosion) dynamically when the AI detects a correct answer.
* **🖼️ Contextual Visuals:** Displays engaging space imagery to guide the conversation.

## 🛠️ Tech Stack

* **Frontend:** React.js + Vite
* **AI Model:** Google Gemini 1.5 Flash (via Direct REST API)
* **Voice:** Web Speech API (SpeechRecognition & SpeechSynthesis)
* **Styling:** CSS-in-JS (Responsive Card Layout)
* **Icons:** Lucide React

## 📦 How to Run Locally

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Anuraj1260/space-tutor-ai.git](https://github.com/Anuraj1260/space-tutor-ai.git)
    cd space-tutor-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    * Open `src/App.jsx`.
    * Find the line: `const API_KEY = "PASTE_YOUR_KEY_HERE";`
    * Replace it with your **Google Gemini API Key**.
    * *(Get a free key here: https://aistudio.google.com/app/apikey)*

4.  **Run the App**
    ```bash
    npm run dev
    ```
5.  **Start Learning**
    * Open `http://localhost:5173` in **Google Chrome** (Required for voice support).
    * Click **"Start Lesson"** and talk to the Captain!

## 📝 Project Flow (Logic)

1.  **Initiation:** User clicks Start -> AI greets the user and asks a question about the image.
2.  **Listening:** Microphone opens automatically after the AI finishes speaking.
3.  **Processing:** User speech is sent to Gemini 1.5 Flash with a system prompt to act as a teacher.
4.  **Tool Call:** If the AI response contains the keyword "CORRECT", the `confetti()` function triggers.
5.  **Completion:** Session ends automatically when the 60-second timer hits zero.

---
*Built for the Real-Time AI Hackathon.*
