// Floating Bubble Pop Game
class BubblePopGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.soundToggle = document.getElementById('soundToggle');
        this.soundIcon = document.getElementById('soundIcon');
        
        this.bubbles = [];
        this.soundEnabled = true;
        this.maxBubbles = 12;
        this.bubbleCreationRate = 900;
        this.backgroundMusic = null;
        this.audioContext = null;
        
        this.init();
    }

    init() {
        console.log('Game initializing...');
        this.setupEventListeners();
        this.initAudio();
        this.createInitialBubbles();
        this.startBubbleGeneration();
    }

    setupEventListeners() {
        // Sound toggle
        this.soundToggle.addEventListener('click', () => {
            this.toggleSound();
        });

        // Prevent context menu on long press (mobile)
        this.gameArea.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Start audio on first user interaction (required by browsers)
        document.addEventListener('click', () => {
            this.startBackgroundMusic();
        }, { once: true });

        document.addEventListener('touchstart', () => {
            this.startBackgroundMusic();
        }, { once: true });
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Web Audio API not supported');
        }
    }

    startBackgroundMusic() {
        if (!this.audioContext || !this.soundEnabled || this.backgroundMusic) return;

        try {
            // Create a soothing ambient background music
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const oscillator3 = this.audioContext.createOscillator();
            
            const gainNode1 = this.audioContext.createGain();
            const gainNode2 = this.audioContext.createGain();
            const gainNode3 = this.audioContext.createGain();
            const masterGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Set up filter for warmth
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filter.Q.setValueAtTime(1, this.audioContext.currentTime);

            // Create harmonic frequencies
            oscillator1.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
            oscillator2.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4
            oscillator3.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4

            oscillator1.type = 'sine';
            oscillator2.type = 'sine';
            oscillator3.type = 'triangle';

            // Connect oscillators to gain nodes
            oscillator1.connect(gainNode1);
            oscillator2.connect(gainNode2);
            oscillator3.connect(gainNode3);
            
            gainNode1.connect(filter);
            gainNode2.connect(filter);
            gainNode3.connect(filter);
            filter.connect(masterGain);
            masterGain.connect(this.audioContext.destination);

            // Set very low volume for ambient background
            gainNode1.gain.setValueAtTime(0.015, this.audioContext.currentTime);
            gainNode2.gain.setValueAtTime(0.01, this.audioContext.currentTime);
            gainNode3.gain.setValueAtTime(0.008, this.audioContext.currentTime);
            masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);

            // Add gentle modulation
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
            lfo.type = 'sine';
            lfoGain.gain.setValueAtTime(3, this.audioContext.currentTime);
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator1.frequency);

            oscillator1.start();
            oscillator2.start();
            oscillator3.start();
            lfo.start();

            this.backgroundMusic = { 
                oscillator1, 
                oscillator2, 
                oscillator3, 
                lfo, 
                masterGain,
                isPlaying: true 
            };

        } catch (error) {
            console.log('Could not start background music:', error);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            try {
                this.backgroundMusic.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
                setTimeout(() => {
                    if (this.backgroundMusic) {
                        this.backgroundMusic.oscillator1.stop();
                        this.backgroundMusic.oscillator2.stop();
                        this.backgroundMusic.oscillator3.stop();
                        this.backgroundMusic.lfo.stop();
                        this.backgroundMusic.isPlaying = false;
                    }
                }, 500);
            } catch (error) {
                console.log('Background music already stopped');
            }
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.soundToggle.classList.toggle('muted', !this.soundEnabled);

        if (this.soundEnabled) {
            // Restart background music if it was stopped
            if (!this.backgroundMusic || !this.backgroundMusic.isPlaying) {
                this.backgroundMusic = null; // Reset to allow recreation
                this.startBackgroundMusic();
            } else if (this.backgroundMusic && this.backgroundMusic.masterGain) {
                this.backgroundMusic.masterGain.gain.exponentialRampToValueAtTime(0.3, this.audioContext.currentTime + 0.5);
            }
        } else {
            this.stopBackgroundMusic();
        }
    }

    createBubble() {
        if (this.bubbles.length >= this.maxBubbles) return;
        
        console.log('Creating bubble...');
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size between 60-100px
        const size = Math.random() * 40 + 60;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Start from bottom of screen with random X position
        const startX = Math.random() * (window.innerWidth - size);
        const startY = window.innerHeight + size;
        
        bubble.style.left = `${startX}px`;
        bubble.style.top = `${startY}px`;
        bubble.style.position = 'absolute';
        bubble.style.zIndex = '100';
        
        // Enhanced visibility with stronger colors
        const colors = [
            'rgba(135, 206, 250, 0.7)', // Sky blue
            'rgba(144, 238, 144, 0.7)', // Light green
            'rgba(255, 182, 193, 0.7)', // Light pink
            'rgba(221, 160, 221, 0.7)', // Plum
            'rgba(255, 218, 185, 0.7)', // Peach
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        bubble.style.background = `radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.9), 
            ${randomColor}, 
            rgba(255, 255, 255, 0.3))`;
        bubble.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        bubble.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
        
        // Add floating animation
        bubble.style.animation = `float ${Math.random() * 3 + 4}s ease-in-out infinite`;
        
        // Add upward movement animation
        this.animateBubbleUpward(bubble, startX, startY);
        
        // Add click event
        bubble.addEventListener('click', (e) => {
            e.preventDefault();
            this.popBubble(bubble, e);
        });
        
        // Add touch event for mobile
        bubble.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.popBubble(bubble, e.touches[0]);
        });
        
        this.gameArea.appendChild(bubble);
        this.bubbles.push(bubble);
        
        console.log(`Bubble created at ${startX}, ${startY}. Total bubbles: ${this.bubbles.length}`);
    }

    animateBubbleUpward(bubble, startX, startY) {
        const startTime = Date.now();
        const duration = Math.random() * 3000 + 5000; // 5-8 seconds
        
        // Target position (top of screen and slightly off)
        const targetY = -100;
        const driftAmount = (Math.random() - 0.5) * 200;
        const targetX = startX + driftAmount;
        
        // Floating parameters for gentle side-to-side movement
        const amplitude = Math.random() * 30 + 20;
        const frequency = Math.random() * 0.001 + 0.0008;
        
        const animate = () => {
            if (!bubble.parentNode || bubble.classList.contains('popping')) {
                return;
            }
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress >= 1) {
                this.removeBubble(bubble);
                return;
            }
            
            // Smooth upward movement
            const currentY = startY + (targetY - startY) * progress;
            
            // Gentle horizontal drift with sine wave
            const sineWave = Math.sin(elapsed * frequency) * amplitude;
            const driftProgress = progress * 0.3;
            const currentX = startX + (targetX - startX) * driftProgress + sineWave;
            
            // Keep bubble within reasonable bounds
            const clampedX = Math.max(-50, Math.min(window.innerWidth + 50, currentX));
            
            bubble.style.left = `${clampedX}px`;
            bubble.style.top = `${currentY}px`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    popBubble(bubble, event) {
        console.log('Bubble popped!');
        
        // Prevent multiple pops
        if (bubble.classList.contains('popping')) return;
        
        bubble.classList.add('popping');
        
        // Create ripple effect
        const rect = bubble.getBoundingClientRect();
        const x = event.clientX || rect.left + rect.width / 2;
        const y = event.clientY || rect.top + rect.height / 2;
        this.createRipple(x, y);
        
        // Play random soothing pop sound
        if (this.soundEnabled) {
            this.playRandomSoothingSound();
        }
        
        // Remove bubble after animation
        setTimeout(() => {
            this.removeBubble(bubble);
        }, 400);
    }

    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        const size = 60;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x - size/2}px`;
        ripple.style.top = `${y - size/2}px`;
        ripple.style.position = 'fixed';
        ripple.style.zIndex = '200';
        
        this.gameArea.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    playRandomSoothingSound() {
        if (!this.audioContext) return;

        try {
            // Array of soothing musical notes and chords
            const soothingSounds = [
                // Pentatonic scale notes (very peaceful)
                { frequencies: [523.25], type: 'sine', duration: 0.8 }, // C5
                { frequencies: [587.33], type: 'sine', duration: 0.8 }, // D5
                { frequencies: [659.25], type: 'sine', duration: 0.8 }, // E5
                { frequencies: [783.99], type: 'sine', duration: 0.8 }, // G5
                { frequencies: [880.00], type: 'sine', duration: 0.8 }, // A5
                
                // Gentle chords
                { frequencies: [523.25, 659.25, 783.99], type: 'sine', duration: 1.2 }, // C major
                { frequencies: [587.33, 739.99, 880.00], type: 'sine', duration: 1.2 }, // D minor
                { frequencies: [659.25, 783.99, 987.77], type: 'sine', duration: 1.2 }, // E minor
                
                // Soft bell-like tones
                { frequencies: [1046.50], type: 'triangle', duration: 1.5 }, // C6
                { frequencies: [1174.66], type: 'triangle', duration: 1.5 }, // D6
                
                // Ethereal pad sounds
                { frequencies: [261.63, 329.63, 392.00, 523.25], type: 'sine', duration: 2.0 }, // C major 7th
            ];

            const randomSound = soothingSounds[Math.floor(Math.random() * soothingSounds.length)];
            
            // Create oscillators for each frequency
            const oscillators = [];
            const gainNodes = [];
            const masterGain = this.audioContext.createGain();

            randomSound.frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                // Set up filter for warmth
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
                filter.Q.setValueAtTime(1, this.audioContext.currentTime);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = randomSound.type;
                
                // Set volume based on number of frequencies (avoid clipping)
                const volume = 0.15 / randomSound.frequencies.length;
                gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + randomSound.duration);
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(masterGain);
                
                oscillators.push(oscillator);
                gainNodes.push(gainNode);
            });

            masterGain.connect(this.audioContext.destination);
            masterGain.gain.setValueAtTime(0.6, this.audioContext.currentTime);

            // Start all oscillators
            oscillators.forEach(osc => {
                osc.start(this.audioContext.currentTime);
                osc.stop(this.audioContext.currentTime + randomSound.duration);
            });

        } catch (error) {
            console.log('Soothing pop! 🎵');
        }
    }

    removeBubble(bubble) {
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) {
            this.bubbles.splice(index, 1);
        }
        
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
        
        console.log(`Bubble removed. Remaining bubbles: ${this.bubbles.length}`);
    }

    createInitialBubbles() {
        console.log('Creating initial bubbles...');
        // Create initial bubbles with staggered timing
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.createBubble();
            }, i * 600);
        }
    }

    startBubbleGeneration() {
        console.log('Starting bubble generation...');
        
        // Regular bubble creation - faster rate
        setInterval(() => {
            if (this.bubbles.length < this.maxBubbles) {
                this.createBubble();
            }
        }, this.bubbleCreationRate);
        
        // More frequent bubble bursts
        setInterval(() => {
            if (Math.random() < 0.4 && this.bubbles.length < this.maxBubbles - 1) {
                setTimeout(() => {
                    this.createBubble();
                }, Math.random() * 400);
            }
        }, 2500);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting game...');
    new BubblePopGame();
});