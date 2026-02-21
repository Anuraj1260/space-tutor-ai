# 🚀 Space Learning Game - Hindi & English (Round 2)

**🌐 Live Demo:** [https://space-tutor-ai.vercel.app/](https://space-tutor-ai.vercel.app/)

An interactive bilingual educational game where an AI "Space Captain" teaches children about space in both Hindi and English. The background changes dynamically based on what the child says, creating an immersive learning experience.

## 🌟 Features

* **🎨 Dynamic Backgrounds:** Screen changes based on child's answers (Earth, Mars, Moon, Sun, Astronaut)
* **🗣️ Bilingual AI:** Every line includes both Hindi and English
* **📚 Gentle English Teaching:** When child speaks Hindi, AI gently teaches the English equivalent
* **🇮🇳 Indian Accent:** AI speaks with Indian English accent (en-IN)
* **🎉 Visual Rewards:** Confetti celebration for correct answers
* **⏱️ 60-Second Game:** Timed learning session with countdown
* **🎤 Voice Recognition:** Recognizes both Hindi and English speech
* **🔄 Continuous Flow:** AI automatically asks next question after feedback

## 🛠️ Tech Stack

* React 19 + Vite
* Groq AI (Llama 3.1-8B Instant)
* Web Speech API (hi-IN for Hindi + English recognition)
* Canvas Confetti
* Lucide React Icons

## 📦 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anuraj1260/space-tutor-ai.git
   cd space-tutor-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   # Create .env file in root directory
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the App**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   * Open `http://localhost:5173` in **Google Chrome**
   * Click **"Start Game"** and answer in Hindi or English!

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Round 2: Complete bilingual space game"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   - Name: `VITE_GROQ_API_KEY`
   - Value: Your Groq API key
6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment
8. Test your deployed link!

## 🎮 How to Play

1. Click "Start Game"
2. AI asks a riddle in Hindi + English
3. Answer using your voice (Hindi or English)
4. Watch the background change when you're correct!
5. Learn English translations when you speak Hindi
6. Play for 60 seconds

## 📝 Example Interaction

**AI:** "नमस्ते! Hello! मैं रात में चमकता हूँ। I shine bright at night. मैं क्या हूँ? What am I?"

**Child:** "चाँद" (Moon in Hindi)

**AI:** "बहुत अच्छा! Very good! In English, we say 'Moon'. अब बताओ, मैं बहुत गर्म हूँ। Now tell me, I am very hot. What am I?"

[Background changes to Moon image + Confetti]

## 🌐 Browser Compatibility

- ✅ **Chrome** (Recommended) - Best voice support
- ✅ **Edge** - Good voice support
- ⚠️ **Firefox** - Limited voice support
- ⚠️ **Safari** - Limited voice support

## 🔗 Links

- **Live App:** [https://space-tutor-ai.vercel.app/](https://space-tutor-ai.vercel.app/)
- **GitHub:** [https://github.com/Anuraj1260/space-tutor-ai](https://github.com/Anuraj1260/space-tutor-ai)

## 📄 License

MIT License - Feel free to use for educational purposes

---
*Built for Round 2 submission - Real-Time AI Learning Platform*
