// --- AGRI-GUARD AI GENERAL JAVASCRIPT ---

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. THEME TOGGLER (DARK / LIGHT MODE)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Load preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-moon text-warning fs-5';
        } else {
            icon.className = 'fa-solid fa-sun text-warning fs-5';
        }
    }

    // 2. MOBILE SIDEBAR TOGGLE
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.app-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('show-sidebar');
        });
        
        document.body.addEventListener('click', function() {
            sidebar.classList.remove('show-sidebar');
        });
        
        sidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // 3. FLOATING CHAT WIDGET CONTROL
    const chatWidgetToggleBtn = document.getElementById('chat-widget-toggle-btn');
    const chatWidgetBox = document.querySelector('.chat-widget-box');
    const chatWidgetClose = document.getElementById('chat-widget-close');
    const chatWidgetMessages = document.getElementById('chat-widget-messages');
    
    if (chatWidgetToggleBtn && chatWidgetBox) {
        chatWidgetToggleBtn.addEventListener('click', function() {
            chatWidgetBox.classList.toggle('d-none');
            scrollToBottom(chatWidgetMessages);
        });
    }
    
    if (chatWidgetClose && chatWidgetBox) {
        chatWidgetClose.addEventListener('click', function() {
            chatWidgetBox.classList.add('d-none');
        });
    }

    // 4. SPEECH-TO-TEXT (CLIENT SIDE WEB SPEECH API)
    const chatWidgetMic = document.getElementById('chat-widget-mic');
    const chatWidgetInput = document.getElementById('chat-widget-input');
    const voiceWavePanel = document.getElementById('voice-wave-panel');
    
    let recognition;
    let isListening = false;
    
    if (chatWidgetMic) {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            // Auto detect language from user's current session setting
            const currentLang = document.getElementById('current-language-display')?.innerText.toLowerCase() || 'en';
            const langCodes = {
                'en': 'en-US',
                'te': 'te-IN',
                'hi': 'hi-IN',
                'ta': 'ta-IN',
                'kn': 'kn-IN',
                'ml': 'ml-IN'
            };
            recognition.lang = langCodes[currentLang] || 'en-US';
            
            recognition.onstart = function() {
                isListening = true;
                voiceWavePanel.classList.remove('d-none');
                chatWidgetMic.classList.add('btn-danger');
                chatWidgetMic.classList.remove('btn-outline-success');
            };
            
            recognition.onend = function() {
                isListening = false;
                voiceWavePanel.classList.add('d-none');
                chatWidgetMic.classList.remove('btn-danger');
                chatWidgetMic.classList.add('btn-outline-success');
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                chatWidgetInput.value = transcript;
                // Auto submit form
                document.getElementById('chat-widget-form').dispatchEvent(new Event('submit'));
            };
            
            recognition.onerror = function(event) {
                console.error("Speech Recognition Error:", event.error);
                alert("Speech recognition error: " + event.error);
            };
            
            chatWidgetMic.addEventListener('click', function() {
                if (isListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });
        } else {
            console.warn("Web Speech API is not supported in this browser. Falling back to audio upload.");
            chatWidgetMic.setAttribute('title', 'Speech recognition not supported in this browser.');
            chatWidgetMic.disabled = true;
        }
    }

    // 5. CHAT FORM SUBMISSION (TEXT, VOICE & IMAGE)
    const chatWidgetForm = document.getElementById('chat-widget-form');
    const chatWidgetImage = document.getElementById('chat-widget-image');
    const chatImagePreviewBadge = document.getElementById('chat-image-preview-badge');
    const chatImagePreviewName = document.getElementById('chat-image-preview-name');
    const clearChatImageBtn = document.getElementById('clear-chat-image');
    
    if (chatWidgetImage) {
        chatWidgetImage.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                chatImagePreviewName.innerText = this.files[0].name;
                chatImagePreviewBadge.classList.remove('d-none');
            }
        });
    }
    
    if (clearChatImageBtn) {
        clearChatImageBtn.addEventListener('click', function() {
            chatWidgetImage.value = '';
            chatImagePreviewBadge.classList.add('d-none');
        });
    }
    
    if (chatWidgetForm) {
        chatWidgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageText = chatWidgetInput.value.trim();
            const imageFile = chatWidgetImage.files[0];
            
            if (!messageText && !imageFile) return;
            
            // Add user bubble
            let userBubbleContent = messageText;
            if (imageFile) {
                userBubbleContent = `<div><i class="fa-solid fa-image me-1"></i> ${imageFile.name}</div>` + (messageText ? `<div>${messageText}</div>` : '');
            }
            
            appendBubble('user-bubble', userBubbleContent);
            chatWidgetInput.value = '';
            
            // Clear image attachment preview
            chatWidgetImage.value = '';
            chatImagePreviewBadge.classList.add('d-none');
            
            // Scroll down
            scrollToBottom(chatWidgetMessages);
            
            // Add skeleton loader bubble for bot
            const skeletonId = 'bot-skeleton-' + Date.now();
            appendSkeletonBubble(skeletonId);
            scrollToBottom(chatWidgetMessages);
            
            // Prepare Form Data
            const formData = new FormData();
            if (messageText) formData.append('message', messageText);
            if (imageFile) formData.append('image', imageFile);
            
            // AJAX to Backend
            fetch('/chat', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Remove skeleton
                const skeleton = document.getElementById(skeletonId);
                if (skeleton) skeleton.remove();
                
                if (data.error) {
                    appendBubble('bot-bubble', `<span class="text-danger">Error: ${data.error}</span>`);
                } else {
                    // Append bot answer
                    appendBubble('bot-bubble', data.message);
                    
                    // Play audio voice if URL provided
                    if (data.voice_url) {
                        playVoice(data.voice_url);
                    }
                }
                scrollToBottom(chatWidgetMessages);
            })
            .catch(error => {
                console.error("Chat AJAX Error:", error);
                const skeleton = document.getElementById(skeletonId);
                if (skeleton) skeleton.remove();
                appendBubble('bot-bubble', '<span class="text-danger">Failed to send request. Server unreachable.</span>');
                scrollToBottom(chatWidgetMessages);
            });
        });
    }

    // Help Helper Functions for Chat bubbles
    function appendBubble(className, content) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${className}`;
        
        const bubbleInner = document.createElement('div');
        bubbleInner.className = 'bubble-content';
        bubbleInner.innerHTML = content;
        
        bubble.appendChild(bubbleInner);
        chatWidgetMessages.appendChild(bubble);
    }
    
    function appendSkeletonBubble(id) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble bot-bubble`;
        bubble.id = id;
        bubble.innerHTML = `
            <div class="bubble-content" style="width: 150px;">
                <div class="skeleton-box mb-1" style="width: 100%;"></div>
                <div class="skeleton-box" style="width: 70%;"></div>
            </div>
        `;
        chatWidgetMessages.appendChild(bubble);
    }
    
    function scrollToBottom(container) {
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
    
    function playVoice(voiceUrl) {
        const player = document.getElementById('global-audio-player');
        if (player) {
            player.src = voiceUrl;
            player.play().catch(err => {
                console.warn("Auto-play voice blocked by browser policy. Interaction needed:", err);
            });
        }
    }
    
    // Make playVoice globally accessible for other sub-pages
    window.playAgriGuardVoice = playVoice;
});
