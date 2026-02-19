import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Mic, MicOff, Volume2, Play } from 'lucide-react';

// --- 👇 YOUR WORKING KEY HERE 👇 ---
const API_KEY = "paste your working key here"; 

const SYSTEM_INSTRUCTION = `
You are a playful teacher talking to a 6-year-old.
1. We are looking at a photo of "Planet Earth from Space" with city lights at night.
2. Ask ONE simple question at a time (e.g., "Do you see the blue ocean?", "Look at the shiny lights!").
3. Wait for the child's answer.
4. If they answer correctly or sound excited, start your reply with "CORRECT".
5. Keep answers under 2 sentences.
`;

export default function App() {
  const [text, setText] = useState("Click 'Start Lesson' to begin!");
  const [status, setStatus] = useState("idle"); // idle, listening, speaking, finished
  const [timeLeft, setTimeLeft] = useState(60); // 1-minute timer
  
  const synthesisRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  // --- 1. SETUP EARS (Microphone) ---
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setStatus("listening");
    recognition.onend = () => {
      // Don't auto-reset status here, we handle flow manually
    };
    
    recognition.onresult = (event) => {
      const userSaid = event.results[0][0].transcript;
      setText(`You: "${userSaid}"`);
      handleAIResponse(userSaid);
    };

    recognitionRef.current = recognition;
  }, []);

  // --- 2. TIMER LOGIC (1 Minute) ---
  useEffect(() => {
    let timer;
    if (status !== "idle" && status !== "finished" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setStatus("finished");
      speak("Great job! Our 1 minute space adventure is done. High five!");
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  // --- 3. START THE GAME (AI INITIATES) ---
// --- 3. START THE GAME (AI INITIATES) ---
  const startLesson = () => {
    setStatus("speaking");
    
    // A list of different ways to start the conversation about the Earth image
    const intros = [
      "Hello! I am your Space Captain. Look at this amazing picture of Earth! Do you see the bright city lights?",
      "Welcome aboard! We are flying high over planet Earth. What colors do you see down there?",
      "Hi there, explorer! Look at our beautiful planet from space. Can you spot the dark oceans?",
      "Greetings! This is Earth shining in the dark. What do you think those shiny golden spots are?"
    ];

    // Pick a random intro from the list above
    const randomIntro = intros[Math.floor(Math.random() * intros.length)];

    setText(randomIntro);
    speak(randomIntro, true); // true = turn on mic after speaking
  };

  // --- 4. AI BRAIN (Gemini) ---
  async function handleAIResponse(userMessage) {
    setStatus("processing");
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${SYSTEM_INSTRUCTION}\n\nUser said: "${userMessage}"`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Good job!";

      // Visual Tool Call
      if (aiText.includes("CORRECT")) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      setText(aiText);
      speak(aiText, true); // Speak, then listen again

    } catch (error) {
      console.error(error);
      setText("Connection error. Try again.");
    }
  }

  // --- 5. MOUTH (Text-to-Speech) ---
  function speak(message, listenAfter = false) {
    synthesisRef.current.cancel();
    setStatus("speaking");
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.2; 
    
    utterance.onend = () => {
      if (listenAfter && timeLeft > 0) {
        setStatus("listening");
        recognitionRef.current.start();
      }
    };
    
    synthesisRef.current.speak(utterance);
  }

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        
        {/* HEADER & TIMER */}
        <div style={styles.header}>
          <h2>🚀 Space Tutor</h2>
          <div style={styles.timer}>Time: {timeLeft}s</div>
        </div>

        {/* IMAGE */}
       <img 
  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80" 
  style={styles.image} 
  alt="Earth from Space"
/>

        {/* CHAT DISPLAY */}
        <div style={styles.textBox}>
          {text}
        </div>

        {/* CONTROLS */}
        <div style={styles.controls}>
          {status === "idle" ? (
            <button onClick={startLesson} style={styles.btnStart}>
              <Play size={24} /> Start Lesson
            </button>
          ) : status === "finished" ? (
            <button disabled style={styles.btnDone}>Session Complete</button>
          ) : (
            <div style={styles.statusIndicator}>
              {status === "listening" ? <Mic color="red" className="pulse" /> : <Volume2 color="blue" />}
              <span>{status === "listening" ? "Listening..." : "AI Speaking..."}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Simple Pulse Animation for Mic */}
      <style>{`
        .pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const styles = {
  body: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#e0f2fe', fontFamily: 'Arial' },
  card: { background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '90%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  timer: { fontWeight: 'bold', color: '#dc2626', background: '#fee2e2', padding: '5px 10px', borderRadius: '10px' },
  image: { width: '100%', height: '220px', objectFit: 'cover', borderRadius: '15px', marginBottom: '20px', border: '4px solid #f3f4f6' },
  textBox: { minHeight: '70px', background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '20px', fontSize: '16px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  controls: { display: 'flex', justifyContent: 'center' },
  btnStart: { background: '#2563eb', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '50px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
  btnDone: { background: '#94a3b8', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '50px', fontSize: '18px' },
  statusIndicator: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', color: '#475569' }
};