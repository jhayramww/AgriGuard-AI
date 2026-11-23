// --- AGRI-GUARD AI CHATBOT INTERFACE LOGIC ---

document.addEventListener('DOMContentLoaded', function() {
    
    // Core Elements
    const chatForm = document.getElementById('chat-main-form');
    const textInput = document.getElementById('chat-main-text-input');
    const imageUpload = document.getElementById('chat-image-upload');
    const imagePreviewBadge = document.getElementById('chat-image-preview-badge');
    const imagePreviewName = document.getElementById('chat-image-preview-name');
    const imagePreviewClear = document.getElementById('chat-image-preview-clear');
    
    const viewport = document.getElementById('chat-conversation-viewport');
    const emptyWelcome = document.getElementById('chat-empty-welcome');
    const messagesContainer = document.querySelector('.messages-container');
    
    // Sidebar & Sidebar Toggle
    const sidebar = document.getElementById('chatbot-right-sidebar');
    const sidebarToggle = document.getElementById('right-sidebar-toggle');
    const sidebarClose = document.getElementById('right-sidebar-close');
    const btnNewChat = document.getElementById('btn-new-chat');
    
    // Language selector
    const langSelector = document.getElementById('chat-lang-selector');
    
    // Settings panel bindings
    const voiceGenderSelect = document.getElementById('settings-voice-gender');
    const voiceSpeedRange = document.getElementById('settings-voice-speed');
    const voiceSpeedVal = document.getElementById('settings-speed-val');
    const themeToggleBtn = document.getElementById('settings-theme-toggle');
    
    // Camera captures
    const camTrigger = document.getElementById('chat-camera-trigger');
    const camPanel = document.querySelector('.chat-camera-panel');
    const camVideo = document.getElementById('chat-video-preview');
    const camSnapBtn = document.getElementById('chat-camera-snap-btn');
    const camCloseBtn = document.getElementById('chat-camera-close-btn');
    const camCanvas = document.getElementById('chat-canvas');
    
    // Weather panel & advisory
    const weatherPanel = document.getElementById('chatbot-weather-panel');
    const weatherShortcut = document.getElementById('weather-panel-shortcut');
    const weatherAudioBtn = document.getElementById('chat-weather-audio-btn');
    
    let activeImageFile = null;
    let activeBase64String = null;
    let cameraStream = null;
    let speechBuffer = null;
    
    // Initialize Scroll
    scrollToBottom();
    
    // --- 1. RIGHT SIDEBAR COLLAPSE & ACCORDION ---
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active-sidebar');
        });
    }
    
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active-sidebar');
        });
    }
    
    // Accordion Headers custom click handler (for glass UI)
    const accordionHeaders = document.querySelectorAll('.accordion-header-btn');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const panel = document.querySelector(targetId);
            
            // Toggle clicked
            const isHidden = panel.classList.contains('d-none');
            
            // Collapse all others
            document.querySelectorAll('.accordion-content-panel').forEach(p => {
                p.classList.add('d-none');
            });
            document.querySelectorAll('.accordion-header-btn').forEach(h => {
                h.classList.remove('active-header');
            });
            
            if (isHidden) {
                panel.classList.remove('d-none');
                this.classList.add('active-header');
            }
        });
    });
    
    // New Chat handler
    if (btnNewChat) {
        btnNewChat.addEventListener('click', function() {
            messagesContainer.innerHTML = '';
            emptyWelcome.classList.remove('d-none');
            weatherPanel.classList.add('d-none');
            scrollToBottom();
            
            // Stop speech synthesis if running
            window.speechSynthesis.cancel();
        });
    }
    
    // --- 2. SETTINGS LISTENER ---
    // Load setting states
    if (voiceGenderSelect) {
        voiceGenderSelect.value = localStorage.getItem('voice_gender') || 'female';
        voiceGenderSelect.addEventListener('change', function() {
            localStorage.setItem('voice_gender', this.value);
        });
    }
    
    if (voiceSpeedRange) {
        const speed = localStorage.getItem('voice_speed') || '1.0';
        voiceSpeedRange.value = speed;
        voiceSpeedVal.innerText = `${speed}x`;
        voiceSpeedRange.addEventListener('input', function() {
            voiceSpeedVal.innerText = `${this.value}x`;
            localStorage.setItem('voice_speed', this.value);
        });
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const htmlElement = document.documentElement;
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const mainThemeBtn = document.getElementById('theme-toggle');
            if (mainThemeBtn) {
                const icon = mainThemeBtn.querySelector('i');
                icon.className = newTheme === 'dark' ? 'fa-solid fa-moon text-warning fs-5' : 'fa-solid fa-sun text-warning fs-5';
            }
        });
    }
    
    // --- 3. AUTO EXPAND TEXTAREA ---
    if (textInput) {
        textInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Enter to submit keybind
        textInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // --- 4. ATTACHMENT PREVIEWS & ACTIONS ---
    if (imageUpload) {
        imageUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                activeImageFile = this.files[0];
                activeBase64String = null;
                imagePreviewName.innerText = this.files[0].name;
                imagePreviewBadge.classList.remove('d-none');
            }
        });
    }
    
    if (imagePreviewClear) {
        imagePreviewClear.addEventListener('click', function() {
            activeImageFile = null;
            activeBase64String = null;
            imageUpload.value = '';
            imagePreviewBadge.classList.add('d-none');
        });
    }
    
    // Camera panel triggers
    if (camTrigger) {
        camTrigger.addEventListener('click', function() {
            camPanel.classList.remove('d-none');
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                cameraStream = stream;
                camVideo.srcObject = stream;
                camSnapBtn.disabled = false;
            })
            .catch(err => {
                console.error("Camera error:", err);
                alert("Camera block or unsupported device.");
                camPanel.classList.add('d-none');
            });
        });
    }
    
    if (camCloseBtn) {
        camCloseBtn.addEventListener('click', closeCameraPanel);
    }
    
    function closeCameraPanel() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            camVideo.srcObject = null;
        }
        camPanel.classList.add('d-none');
    }
    
    if (camSnapBtn) {
        camSnapBtn.addEventListener('click', function() {
            if (cameraStream) {
                const width = camVideo.videoWidth;
                const height = camVideo.videoHeight;
                camCanvas.width = width;
                camCanvas.height = height;
                
                const context = camCanvas.getContext('2d');
                context.drawImage(camVideo, 0, 0, width, height);
                
                const base64 = camCanvas.toDataURL('image/jpeg');
                activeBase64String = base64;
                activeImageFile = null;
                
                imagePreviewName.innerText = "camera_capture.jpg";
                imagePreviewBadge.classList.remove('d-none');
                closeCameraPanel();
            }
        });
    }
    
    // --- 5. SPEECH SYNTHESIS API (GENDER & SPEED FILTERS) ---
    function speakTextLocal(text, lang) {
        // Cancel ongoing speak
        window.speechSynthesis.cancel();
        
        if (!text) return;
        
        const langCodes = {
            'en': 'en-US',
            'te': 'te-IN',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN'
        };
        const targetLang = langCodes[lang] || 'en-US';
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        
        // Load custom settings
        const speed = parseFloat(localStorage.getItem('voice_speed') || '1.0');
        const gender = localStorage.getItem('voice_gender') || 'female';
        
        utterance.rate = speed;
        
        // Find suitable voice in browser matching language and gender keyword
        const voices = window.speechSynthesis.getVoices();
        let matchedVoice = null;
        
        const lowercaseTarget = targetLang.toLowerCase();
        
        // Filter voices by language match
        const langVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-') === lowercaseTarget || v.lang.toLowerCase().includes(lowercaseTarget.split('-')[0]));
        
        if (langVoices.length > 0) {
            // Find gender match
            const genderVoices = langVoices.filter(v => {
                const name = v.name.toLowerCase();
                if (gender === 'male') {
                    return name.includes('male') || name.includes('david') || name.includes('microsoft') && !name.includes('zira');
                } else {
                    return name.includes('female') || name.includes('zira') || name.includes('hazel');
                }
            });
            matchedVoice = genderVoices.length > 0 ? genderVoices[0] : langVoices[0];
        }
        
        if (matchedVoice) {
            utterance.voice = matchedVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    }
    
    // Force loading voices in Chrome
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {};
    }
    
    // --- 6. VOICE MIC STT BIND ---
    const micBtn = document.getElementById('chat-mic-trigger');
    const listenIndicator = document.getElementById('chat-voice-listen-indicator');
    let recognition = null;
    let micListening = false;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = function() {
            micListening = true;
            listenIndicator.classList.remove('d-none');
            micBtn.querySelector('i').className = 'fa-solid fa-microphone-slash text-danger';
        };
        
        recognition.onend = function() {
            micListening = false;
            listenIndicator.classList.add('d-none');
            micBtn.querySelector('i').className = 'fa-solid fa-microphone text-success';
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            textInput.value = transcript;
            chatForm.dispatchEvent(new Event('submit'));
        };
        
        micBtn.addEventListener('click', function() {
            if (recognition) {
                const currentLang = langSelector.value;
                const langCodes = {
                    'en': 'en-US', 'te': 'te-IN', 'hi': 'hi-IN', 
                    'ta': 'ta-IN', 'kn': 'kn-IN', 'ml': 'ml-IN'
                };
                recognition.lang = langCodes[currentLang] || 'en-US';
                
                if (micListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            }
        });
    } else {
        micBtn.disabled = true;
        micBtn.setAttribute('title', 'Browser speech recognition not supported.');
    }
    
    // --- 7. CHAT FORM AJAX SUBMISSION ---
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const queryText = textInput.value.trim();
            const uploadedImg = activeImageFile;
            const capturedBase64 = activeBase64String;
            
            if (!queryText && !uploadedImg && !capturedBase64) return;
            
            // Clear inputs
            textInput.value = '';
            textInput.style.height = 'auto';
            
            activeImageFile = null;
            activeBase64String = null;
            imagePreviewBadge.classList.add('d-none');
            
            // Hide welcome screen
            emptyWelcome.classList.add('d-none');
            
            // 1. Append User Bubble
            let userContent = queryText;
            if (uploadedImg) {
                userContent = `<div><i class="fa-solid fa-file-image me-1"></i> ${uploadedImg.name}</div>` + (queryText ? `<div class="mt-1">${queryText}</div>` : '');
            } else if (capturedBase64) {
                userContent = `<div><i class="fa-solid fa-camera me-1"></i> camera_capture.jpg</div>` + (queryText ? `<div class="mt-1">${queryText}</div>` : '');
            }
            appendBubble('user-bubble', userContent, true);
            scrollToBottom();
            
            // 2. Append Bot Skeleton loader
            const skeletonId = 'bot-sk-' + Date.now();
            appendSkeletonBubble(skeletonId);
            scrollToBottom();
            
            // 3. Prepare AJAX Form Data
            const formData = new FormData();
            if (queryText) formData.append('message', queryText);
            
            const selectedLang = langSelector.value;
            // Crop type extraction from text or tabs
            formData.append('crop_type', 'Tomato');
            
            if (uploadedImg) {
                formData.append('image', uploadedImg);
            } else if (capturedBase64) {
                formData.append('image_base64', capturedBase64);
            }
            
            // Trigger POST Request
            fetch('/chat', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                // Delete skeleton
                const sk = document.getElementById(skeletonId);
                if (sk) sk.remove();
                
                if (data.error) {
                    appendBubble('bot-bubble', `<span class="text-danger">Error: ${data.error}</span>`, false);
                } else {
                    // Append streaming/typing animation or write directly
                    simulateStreamingResponse(data.message, data.voice_url);
                }
            })
            .catch(err => {
                console.error("Chat error:", err);
                const sk = document.getElementById(skeletonId);
                if (sk) sk.remove();
                appendBubble('bot-bubble', `<span class="text-danger">Communication failed. Server offline.</span>`, false);
                scrollToBottom();
            });
        });
    }
    
    // Simulate typing/streaming response
    function simulateStreamingResponse(responseText, gTTSUrl) {
        const row = document.createElement('div');
        row.className = 'chat-message-row bot-row d-flex justify-content-start align-items-start gap-3';
        
        const timestamp = formatAMPM(new Date());
        
        row.innerHTML = `
            <div class="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; flex-shrink: 0;">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="message-bubble-wrapper d-flex flex-column align-items-start">
                <div class="chat-bubble bot-bubble rounded-4 p-3 shadow-sm bg-light-translucent border border-translucent text-white" style="max-width: 85%;">
                    <div class="bubble-text"></div>
                </div>
                
                <div class="bubble-actions d-flex gap-2 mt-1.5 align-items-center opacity-0 transition-opacity">
                    <small class="text-muted fs-xxs me-2">${timestamp}</small>
                    <button class="btn btn-link p-0 text-muted btn-xs copy-response-btn" title="Copy Text"><i class="fa-regular fa-copy"></i></button>
                    <button class="btn btn-link p-0 text-muted btn-xs like-response-btn" title="Like"><i class="fa-regular fa-thumbs-up"></i></button>
                    <button class="btn btn-link p-0 text-muted btn-xs dislike-response-btn" title="Dislike"><i class="fa-regular fa-thumbs-down"></i></button>
                    <button class="btn btn-link p-0 text-muted btn-xs regenerate-response-btn" title="Regenerate"><i class="fa-solid fa-rotate-right"></i></button>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(row);
        scrollToBottom();
        
        const textContainer = row.querySelector('.bubble-text');
        const actionsRow = row.querySelector('.bubble-actions');
        
        // Simple typewriter streaming simulation
        let i = 0;
        const speed = 15; // ms per char
        
        // Format response slightly (replace newlines with <br>)
        const formattedResponse = responseText.replace(/\n/g, '<br>').replace(/\*/g, '');
        
        function typeWriter() {
            if (i < responseText.length) {
                // Quick HTML tag skip to avoid broken tags during streaming
                if (responseText.charAt(i) === '<') {
                    const tagEnd = responseText.indexOf('>', i);
                    if (tagEnd !== -1) {
                        textContainer.innerHTML += responseText.substring(i, tagEnd + 1);
                        i = tagEnd + 1;
                    } else {
                        textContainer.innerHTML += responseText.charAt(i);
                        i++;
                    }
                } else if (responseText.charAt(i) === '\n') {
                    textContainer.innerHTML += '<br>';
                    i++;
                } else {
                    textContainer.innerHTML += responseText.charAt(i);
                    i++;
                }
                
                scrollToBottom();
                setTimeout(typeWriter, speed);
            } else {
                // Done typing, reveal actions
                actionsRow.classList.remove('opacity-0');
                bindBubbleActionListeners(row, responseText);
                
                // Read text aloud
                const currentLang = langSelector.value;
                if (window.speechSynthesis) {
                    speakTextLocal(responseText, currentLang);
                } else if (gTTSUrl && window.playAgriGuardVoice) {
                    window.playAgriGuardVoice(gTTSUrl);
                }
            }
        }
        
        typeWriter();
    }
    
    function appendBubble(className, content, isUser) {
        const row = document.createElement('div');
        row.className = `chat-message-row ${isUser ? 'user-row d-flex justify-content-end' : 'bot-row d-flex justify-content-start'} align-items-start gap-3`;
        
        const timestamp = formatAMPM(new Date());
        
        if (isUser) {
            const userInitial = document.querySelector('.user-avatar')?.innerText || 'F';
            row.innerHTML = `
                <div class="message-bubble-wrapper d-flex flex-column align-items-end">
                    <div class="chat-bubble user-bubble rounded-4 p-3 shadow-sm bg-success text-white">
                        <div class="bubble-text">${content}</div>
                    </div>
                    <small class="text-muted fs-xxs mt-1">${timestamp}</small>
                </div>
                <div class="avatar bg-success-translucent text-success rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px; flex-shrink: 0;">
                    ${userInitial}
                </div>
            `;
        } else {
            row.innerHTML = `
                <div class="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; flex-shrink: 0;">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="message-bubble-wrapper d-flex flex-column align-items-start">
                    <div class="chat-bubble bot-bubble rounded-4 p-3 shadow-sm bg-light-translucent border border-translucent text-white" style="max-width: 85%;">
                        <div class="bubble-text">${content}</div>
                    </div>
                    <div class="bubble-actions d-flex gap-2 mt-1.5 align-items-center">
                        <small class="text-muted fs-xxs me-2">${timestamp}</small>
                        <button class="btn btn-link p-0 text-muted btn-xs copy-response-btn" title="Copy Text"><i class="fa-regular fa-copy"></i></button>
                        <button class="btn btn-link p-0 text-muted btn-xs like-response-btn" title="Like"><i class="fa-regular fa-thumbs-up"></i></button>
                        <button class="btn btn-link p-0 text-muted btn-xs dislike-response-btn" title="Dislike"><i class="fa-regular fa-thumbs-down"></i></button>
                        <button class="btn btn-link p-0 text-muted btn-xs regenerate-response-btn" title="Regenerate"><i class="fa-solid fa-rotate-right"></i></button>
                    </div>
                </div>
            `;
            // Bind actions right away
            bindBubbleActionListeners(row, content);
        }
        
        messagesContainer.appendChild(row);
    }
    
    function appendSkeletonBubble(id) {
        const row = document.createElement('div');
        row.className = 'chat-message-row bot-row d-flex justify-content-start align-items-start gap-3';
        row.id = id;
        row.innerHTML = `
            <div class="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="message-bubble-wrapper d-flex flex-column align-items-start">
                <div class="chat-bubble bot-bubble rounded-4 p-3 shadow-sm bg-light-translucent border border-translucent text-white" style="width: 160px;">
                    <div class="skeleton-box mb-1.5" style="width: 100%;"></div>
                    <div class="skeleton-box" style="width: 60%;"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(row);
    }
    
    // Bind buttons in message bubble (copy, thumbs up/down, regenerate)
    function bindBubbleActionListeners(bubbleRow, textContent) {
        const copyBtn = bubbleRow.querySelector('.copy-response-btn');
        const likeBtn = bubbleRow.querySelector('.like-response-btn');
        const dislikeBtn = bubbleRow.querySelector('.dislike-response-btn');
        const regenBtn = bubbleRow.querySelector('.regenerate-response-btn');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(textContent)
                .then(() => {
                    const icon = copyBtn.querySelector('i');
                    icon.className = 'fa-solid fa-check text-success';
                    setTimeout(() => {
                        icon.className = 'fa-regular fa-copy';
                    }, 2000);
                });
            });
        }
        
        if (likeBtn) {
            likeBtn.addEventListener('click', function() {
                const icon = likeBtn.querySelector('i');
                icon.className = 'fa-solid fa-thumbs-up text-success animate-pulse';
                bubbleRow.querySelector('.dislike-response-btn i').className = 'fa-regular fa-thumbs-down';
            });
        }
        
        if (dislikeBtn) {
            dislikeBtn.addEventListener('click', function() {
                const icon = dislikeBtn.querySelector('i');
                icon.className = 'fa-solid fa-thumbs-down text-danger animate-pulse';
                bubbleRow.querySelector('.like-response-btn i').className = 'fa-regular fa-thumbs-up';
            });
        }
        
        if (regenBtn) {
            regenBtn.addEventListener('click', function() {
                // Find preceding user text message to resubmit
                let sibling = bubbleRow.previousElementSibling;
                while (sibling) {
                    if (sibling.classList.contains('user-row')) {
                        const userText = sibling.querySelector('.bubble-text').innerText;
                        textInput.value = userText;
                        chatForm.dispatchEvent(new Event('submit'));
                        break;
                    }
                    sibling = sibling.previousElementSibling;
                }
            });
        }
    }
    
    // --- 8. QUICK ACTION SHORTCUTS ---
    const shortcuts = document.querySelectorAll('.chat-shortcuts-scroller button');
    shortcuts.forEach(btn => {
        btn.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            if (query) {
                textInput.value = query;
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    });
    
    // Voice chat shortcut simulation
    const voiceShortcut = document.getElementById('voice-chat-shortcut');
    if (voiceShortcut) {
        voiceShortcut.addEventListener('click', function() {
            micBtn.dispatchEvent(new Event('click'));
        });
    }
    
    // Weather panel shortcut
    if (weatherShortcut) {
        weatherShortcut.addEventListener('click', function() {
            weatherPanel.classList.toggle('d-none');
            scrollToBottom();
            
            // If panel revealed and not loaded, run weather geolocation
            if (!weatherPanel.classList.contains('d-none')) {
                loadWeatherTelemetry();
            }
        });
    }
    
    // --- 9. GEOLOCATION WEATHER TELEMETRY FEED ---
    function loadWeatherTelemetry() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => fetchWeatherPanelData(pos.coords.latitude, pos.coords.longitude),
                err => fetchWeatherPanelData(16.3067, 80.4365) // fallback AP
            );
        } else {
            fetchWeatherPanelData(16.3067, 80.4365);
        }
    }
    
    function fetchWeatherPanelData(lat, lng) {
        document.getElementById('chat-weather-city').innerText = "Loading GPS...";
        
        fetch('/get-weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lng })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('chat-weather-city').innerText = data.city;
            document.getElementById('chat-weather-time').innerText = formatAMPM(new Date()) + ", " + new Date().toLocaleDateString();
            document.getElementById('chat-weather-temp').innerText = `${data.temp}°C`;
            document.getElementById('chat-weather-condition').innerText = data.condition;
            document.getElementById('chat-weather-humidity').innerText = `${data.humidity}%`;
            document.getElementById('chat-weather-uv').innerText = `${data.uv_index}/10`;
            document.getElementById('chat-weather-wind').innerText = `${data.wind_speed} km/h`;
            
            // 7-day forecast cards
            const forecastRow = document.getElementById('chat-weather-forecast-row');
            forecastRow.innerHTML = '';
            data.forecast.forEach(f => {
                let conditionIcon = 'fa-sun text-warning';
                if (f.condition.toLowerCase().includes('rain')) conditionIcon = 'fa-cloud-showers-water text-info';
                else if (f.condition.toLowerCase().includes('cloud')) conditionIcon = 'fa-cloud text-secondary';
                else if (f.condition.toLowerCase().includes('storm')) conditionIcon = 'fa-cloud-bolt text-danger';
                
                const col = document.createElement('div');
                col.className = 'col px-1';
                col.innerHTML = `
                    <div class="bg-light-translucent border border-translucent rounded py-2 px-1 h-100">
                        <small class="text-muted d-block fs-xxs mb-1">${f.day}</small>
                        <i class="fa-solid ${conditionIcon} mb-1 fs-6"></i>
                        <span class="d-block fw-bold text-white small">${f.temp}°C</span>
                    </div>
                `;
                forecastRow.appendChild(col);
            });
            
            // Advisory list
            const advList = document.getElementById('chat-weather-advisory-list');
            advList.innerHTML = '';
            data.advisory.forEach(bullet => {
                const li = document.createElement('li');
                li.className = 'list-group-item bg-transparent text-white border-0 ps-0 py-1.5 d-flex align-items-start';
                li.innerHTML = `<i class="fa-solid fa-circle-check text-success me-2 mt-1 fs-xs"></i> <div class="small text-start">${bullet}</div>`;
                advList.appendChild(li);
            });
            
            // Audio advisory binder
            if (data.advisory_voice_url) {
                weatherAudioBtn.onclick = function() {
                    const currentLang = langSelector.value;
                    const advisoryText = data.advisory.join(" ");
                    if (window.speechSynthesis) {
                        speakTextLocal(advisoryText, currentLang);
                    } else if (window.playAgriGuardVoice) {
                        window.playAgriGuardVoice(data.advisory_voice_url);
                    }
                };
                weatherAudioBtn.classList.remove('disabled');
            }
            
            scrollToBottom();
        })
        .catch(err => {
            console.error("Telemetry error:", err);
            document.getElementById('chat-weather-city').innerText = "Fetch Error";
        });
    }
    
    // --- 10. UTILITIES ---
    function scrollToBottom() {
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
    
    function formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }
});
