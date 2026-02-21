import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Mic, Volume2, Play } from 'lucide-react';

// API Key from environment variable (secure for deployment)
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const spaceImages = {
  "earth": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
  "mars": "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1920&q=80",
  "moon": "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=1920&q=80",
  "sun": "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920&q=80",
  "astronaut": "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?w=1920&q=80"
};

// STRONGER PROMPT: Forces translation and stops repetition
const SYSTEM_INSTRUCTION = `
You are a Space Captain playing a "Space Guessing Game" with a 6-year-old child.

STRICT TOPIC RULE: You can ONLY ask riddles about these 5 space objects: MOON, SUN, EARTH, MARS, ASTRONAUT. Never ask about anything else!

CRITICAL RULES:
1. BACKGROUND CHANGE (MANDATORY): When child guesses correctly (moon, sun, earth, mars, astronaut), you MUST include [CHANGE_BG:moon] or [CHANGE_BG:sun] etc. in your response.
2. BILINGUAL FORMAT: Use this exact format - Hindi first, then ||SPLIT|| marker, then English. Example: "बहुत अच्छा! सही है! ||SPLIT|| Very good! That's right!"
3. TRANSLATION RULE: If child speaks Hindi (e.g., "चाँद" for moon), respond: "बहुत अच्छा! ||SPLIT|| Very good! [CHANGE_BG:moon] ||SPLIT|| In English we say Moon."
4. ALWAYS ASK NEXT QUESTION: After giving feedback (correct or wrong), IMMEDIATELY ask a new riddle about ONE of the 5 space objects (moon, sun, earth, mars, astronaut).
5. KEEP IT SHORT: Maximum 35 words total including the new question.
6. ALWAYS use ||SPLIT|| to separate Hindi and English parts.
7. ONLY USE THESE RIDDLES - Pick one randomly:

MOON riddles:
- "मैं रात में चमकता हूँ। ||SPLIT|| I shine at night. What am I?"
- "मैं पृथ्वी के चारों ओर घूमता हूँ। ||SPLIT|| I go around Earth. What am I?"

SUN riddles:
- "मैं बहुत गर्म हूँ और दिन में चमकता हूँ। ||SPLIT|| I am very hot and shine during the day. What am I?"
- "मैं सबसे बड़ा तारा हूँ। ||SPLIT|| I am the biggest star. What am I?"

EARTH riddles:
- "हम इस ग्रह पर रहते हैं। ||SPLIT|| We live on this planet. What am I?"
- "मैं नीला ग्रह हूँ। ||SPLIT|| I am the blue planet. What am I?"

MARS riddles:
- "मैं लाल ग्रह हूँ। ||SPLIT|| I am the red planet. What am I?"
- "मेरा रंग लाल है। ||SPLIT|| My color is red. What am I?"

ASTRONAUT riddles:
- "मैं अंतरिक्ष में जाता हूँ। ||SPLIT|| I go to space. Who am I?"
- "मैं स्पेस सूट पहनता हूँ। ||SPLIT|| I wear a space suit. Who am I?"

Examples:
- Correct answer: "बहुत बढ़िया! सही है! [CHANGE_BG:sun] ||SPLIT|| Very good! That's right! ||SPLIT|| अब बताओ, मैं रात में चमकता हूँ। ||SPLIT|| Now tell me, I shine at night. What am I?"
- Wrong answer: "कोशिश करो! ||SPLIT|| Try again! ||SPLIT|| मैं बहुत गर्म हूँ। ||SPLIT|| I am very hot."
- Hindi answer: "सही है! [CHANGE_BG:moon] ||SPLIT|| Correct! In English we say Moon. ||SPLIT|| अब, मैं लाल ग्रह हूँ। ||SPLIT|| Now, I am a red planet. What am I?"
`;

export default function App() {
  const [text, setText] = useState("Click 'Start Game' to begin!");
  const [status, setStatus] = useState("idle"); 
  const [timeLeft, setTimeLeft] = useState(60); 
  const [currentBg, setCurrentBg] = useState(spaceImages["earth"]); 
  const [hasStarted, setHasStarted] = useState(false); 
  
  const [convoHistory, setConvoHistory] = useState("");

  const synthesisRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'hi-IN'; 
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    
    let recognitionTimeout;
    let finalTranscript = '';
    let interimTranscript = '';
    
    recognition.onstart = () => {
      console.log("🎤 Microphone started - Speak now!");
      setStatus("listening");
      finalTranscript = '';
      interimTranscript = '';
      
      recognitionTimeout = setTimeout(() => {
        try {
          recognition.stop();
          console.log("⏱️ Recognition stopping after 8 seconds");
        } catch (e) {}
      }, 8000);
    };
    
    recognition.onend = () => {
      console.log("🛑 Microphone ended");
      clearTimeout(recognitionTimeout);
      
      if (finalTranscript.trim()) {
        console.log("📝 Final transcript:", finalTranscript);
        setText(`You: "${finalTranscript}"`);
        handleAIResponse(finalTranscript);
        setStatus("processing");
      } else {
        console.log("No speech captured, returning to idle");
        setStatus("idle");
      }
    };
    
    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
      clearTimeout(recognitionTimeout);
      
      if (event.error === 'no-speech') {
        console.log("No speech detected, click 'Tap to Answer' to retry");
        setText("No speech detected. Click 'Tap to Answer' to try again.");
        setStatus("idle");
      } else if (event.error === 'aborted') {
        setStatus("idle");
      } else if (event.error === 'not-allowed') {
        setStatus("idle");
        setText("⚠️ Microphone permission denied. Please allow microphone access and refresh.");
      } else {
        setStatus("idle");
        setText("Microphone error. Click 'Tap to Answer' to try again.");
      }
    };
    
    recognition.onresult = (event) => {
      interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          console.log("✅ Final result:", transcript);
        } else {
          interimTranscript += transcript;
          console.log("⏳ Interim result:", transcript);
        }
      }
      
      const displayText = finalTranscript + interimTranscript;
      if (displayText.trim()) {
        setText(`Listening: "${displayText.trim()}"`);
      }
    };

    recognitionRef.current = recognition;
    
    return () => {
      clearTimeout(recognitionTimeout);
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    let timer;
    if (hasStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && status !== "finished") {
      synthesisRef.current.cancel();
      try { recognitionRef.current.stop(); } catch (e) {}
      setStatus("finished");
      
      setText("बहुत बढ़िया! खेल खत्म हुआ। Great job! Our game is over. You played well!");
      
      const finalUtterance = new SpeechSynthesisUtterance("बहुत बढ़िया! खेल खत्म हुआ।");
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.name.toLowerCase().includes('hindi'));
      if (hindiVoice) finalUtterance.voice = hindiVoice;
      finalUtterance.lang = 'hi-IN';
      finalUtterance.rate = 0.9;
      
      finalUtterance.onend = () => {
        const englishUtterance = new SpeechSynthesisUtterance("Great job! Our game is over. You played well!");
        const indianEnglishVoice = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
        if (indianEnglishVoice) englishUtterance.voice = indianEnglishVoice;
        englishUtterance.lang = 'en-IN';
        englishUtterance.rate = 0.9;
        synthesisRef.current.speak(englishUtterance);
      };
      
      setTimeout(() => {
        synthesisRef.current.speak(finalUtterance);
      }, 500);
    }
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, status]);

  const startLesson = () => {
    setHasStarted(true);
    setStatus("speaking");
    
    const intros = [
      "नमस्ते! चलो खेलते हैं। मैं रात में चमकता हूँ। मैं क्या हूँ? ||SPLIT|| Hello! Let's play! I shine bright at night. What am I?",
      "नमस्ते! मैं एक लाल ग्रह हूँ। मेरा नाम बताओ। ||SPLIT|| Hello! I am a red planet. Can you guess my name?",
      "नमस्ते! मैं बहुत गर्म हूँ। मैं दिन में चमकता हूँ। ||SPLIT|| Hello! I am very hot. I shine during the day. What am I?"
    ];

    const randomIntro = intros[Math.floor(Math.random() * intros.length)];
    
    setConvoHistory(`Captain: ${randomIntro}\n`);
    setText(randomIntro.replace(/\|\|SPLIT\|\|/g, ' '));
    speakBilingual(randomIntro, true); 
  };

  const manualStartMic = () => {
    if (timeLeft <= 0) {
      return;
    }
    setStatus("listening");
    try { 
      recognitionRef.current.start(); 
      console.log("🎤 Manual microphone activation");
    } catch (e) {
      console.error("Failed to start mic manually:", e);
      setStatus("idle");
      setText("Microphone error. Please check permissions and try again.");
    }
  };

  async function handleAIResponse(userMessage) {
    setStatus("processing");
    try {
      const currentScript = `${convoHistory}Child: ${userMessage}\nCaptain: `;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: SYSTEM_INSTRUCTION },
              { role: "user", content: `Here is the game transcript so far. Continue the game as the Captain:\n\n${currentScript}` }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        }
      );

      const data = await response.json();
      
      let aiText = data.choices?.[0]?.message?.content;
      if (!aiText) {
         console.error("Groq didn't return text:", data);
         aiText = "Oh no, my radio broke! Can you repeat that?";
      }

      if (aiText.includes("CORRECT") || aiText.includes("सही") || aiText.includes("बहुत अच्छा")) {
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      }

      let bgMatch = aiText.match(/\[CHANGE_BG:\s*(\w+)\]/i);
      if (bgMatch && bgMatch[1]) {
        const detectedBg = bgMatch[1].toLowerCase().trim();
        if (spaceImages[detectedBg]) {
          setCurrentBg(spaceImages[detectedBg]);
        }
      } else {
        const userLower = userMessage.toLowerCase();
        if (userLower.includes('moon') || userLower.includes('चाँद') || userLower.includes('चांद')) {
          setCurrentBg(spaceImages['moon']);
        } else if (userLower.includes('sun') || userLower.includes('सूरज') || userLower.includes('सूर्य')) {
          setCurrentBg(spaceImages['sun']);
        } else if (userLower.includes('earth') || userLower.includes('पृथ्वी')) {
          setCurrentBg(spaceImages['earth']);
        } else if (userLower.includes('mars') || userLower.includes('मंगल')) {
          setCurrentBg(spaceImages['mars']);
        } else if (userLower.includes('astronaut') || userLower.includes('अंतरिक्ष यात्री')) {
          setCurrentBg(spaceImages['astronaut']);
        }
      }

      const cleanText = aiText.replace(/\[CHANGE_BG:\s*(.*?)\]/gi, '').trim();
      
      setConvoHistory(`${currentScript}${cleanText}\n`);
      setText(cleanText.replace(/\|\|SPLIT\|\|/g, ' '));
      speakBilingual(cleanText, true);

    } catch (error) {
      console.error(error);
      setText("Connection error. Try again.");
      setStatus("idle");
    }
  }

  function speakBilingual(message, listenAfter = false) {
    synthesisRef.current.cancel();
    setStatus("speaking");

    const parts = message.split('||SPLIT||').map(p => p.trim()).filter(p => p.length > 0);

    if (parts.length === 0) {
      if (listenAfter) {
        setTimeout(() => {
          setStatus("listening");
          try { recognitionRef.current.start(); } catch (e) {}
        }, 400);
      } else {
        setStatus("idle");
      }
      return;
    }

    const voices = window.speechSynthesis.getVoices();

    const hindiVoice = voices.find(v =>
      v.lang === 'hi-IN' ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('lekha')
    );

    const indianEnglishVoice = voices.find(v =>
      v.lang === 'en-IN' ||
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('rishi') ||
      v.name.toLowerCase().includes('neel')
    );

    let currentIndex = 0;

    function speakNextPart() {
      if (currentIndex >= parts.length) {
        if (listenAfter) {
          setTimeout(() => {
            setStatus("listening");
            try { 
              recognitionRef.current.start(); 
            } catch (e) {
              console.error("Failed to start recognition:", e);
              setStatus("idle");
            }
          }, 400);
        } else {
          setStatus("idle");
        }
        return;
      }

      const part = parts[currentIndex];
      const utterance = new SpeechSynthesisUtterance(part);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const isHindi = /[\u0900-\u097F]/.test(part);

      if (isHindi && hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else if (indianEnglishVoice) {
        utterance.voice = indianEnglishVoice;
        utterance.lang = 'en-IN';
      } else {
        utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      }

      utterance.onend = () => {
        currentIndex++;
        setTimeout(speakNextPart, 200);
      };

      synthesisRef.current.speak(utterance);
    }

    speakNextPart();
  }

  return (
    <div style={{
      ...styles.body,
      backgroundImage: `url(${currentBg})`
    }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>🚀 Space Game</h2>
          <div style={styles.timer}>Time: {timeLeft}s</div>
        </div>

        <div style={styles.textBox}>{text}</div>

        <div style={styles.controls}>
          {!hasStarted && status === "idle" ? (
            <button onClick={startLesson} style={styles.btnStart}>
              <Play size={24} /> Start Game
            </button>
          ) : hasStarted && status === "idle" ? (
            <button onClick={manualStartMic} style={styles.btnMic}>
              <Mic size={24} /> Tap to Answer
            </button>
          ) : status === "finished" ? (
            <button disabled style={styles.btnDone}>Session Complete</button>
          ) : (
            <div style={styles.statusIndicator}>
              {status === "listening" ? <Mic color="red" className="pulse" /> : 
               status === "processing" ? <span className="pulse">Thinking...</span> :
               <Volume2 color="blue" className="pulse" />}
              <span>{status === "listening" ? "Listening..." : status === "processing" ? "Thinking..." : "AI Speaking..."}</span>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

const styles = {
  body: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image 0.8s ease-in-out', fontFamily: 'Arial', margin: 0, padding: 0 },
  card: { background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '30px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '450px', width: '90%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' },
  timer: { fontWeight: 'bold', color: '#dc2626', background: 'rgba(254, 226, 226, 0.9)', padding: '8px 15px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' },
  textBox: { minHeight: '100px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(5px)', padding: '20px', borderRadius: '15px', marginBottom: '25px', fontSize: '19px', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', border: '1px solid rgba(255, 255, 255, 0.5)', fontWeight: '500' },
  controls: { display: 'flex', justifyContent: 'center', height: '60px' },
  btnStart: { background: '#2563eb', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '50px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' },
  btnMic: { background: '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '50px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' },
  btnDone: { color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '12px 30px', borderRadius: '50px', fontSize: '20px', backdropFilter: 'blur(5px)', background: 'rgba(100, 116, 139, 0.8)' },
  statusIndicator: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px' }
};
