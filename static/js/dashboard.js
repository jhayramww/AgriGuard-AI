// --- AGRI-GUARD AI DASHBOARD LOGIC ---

document.addEventListener('DOMContentLoaded', function() {
    
    // Geolocation and Weather Loading
    loadWeatherAndCoordinates();
    
    // Initialize Dashboard Charts
    initializeDashboardCharts();
    
    function loadWeatherAndCoordinates() {
        const weatherCity = document.getElementById('weather-city');
        const weatherTemp = document.getElementById('weather-temp');
        const weatherHumidity = document.getElementById('weather-humidity');
        const weatherWind = document.getElementById('weather-wind');
        const weatherRain = document.getElementById('weather-rain');
        const weatherUV = document.getElementById('weather-uv');
        const weatherStatus = document.getElementById('weather-status');
        const weatherAdvisoryList = document.getElementById('weather-advisory-list');
        const weatherAudioPlay = document.getElementById('weather-audio-play');
        const forecastContainer = document.getElementById('forecast-days-container');
        
        // Show Skeletons
        toggleSkeletons(true);
        
        // Attempt GPS geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    fetchWeatherData(lat, lng);
                },
                function(error) {
                    console.warn("Geolocation permission denied or timed out. Using default crop zone coords (Guntur, AP).", error);
                    // Default Guntur coords (India's major crop region)
                    fetchWeatherData(16.3067, 80.4365);
                },
                { timeout: 5000 }
            );
        } else {
            console.warn("Geolocation not supported by browser. Using default.");
            fetchWeatherData(16.3067, 80.4365);
        }
        
        function fetchWeatherData(lat, lng) {
            fetch('/get-weather', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: lat, longitude: lng })
            })
            .then(res => res.json())
            .then(data => {
                // Populate Weather panel
                if (weatherCity) weatherCity.innerText = data.city;
                if (weatherTemp) weatherTemp.innerText = `${data.temp}°C`;
                if (weatherHumidity) weatherHumidity.innerText = `${data.humidity}%`;
                if (weatherWind) weatherWind.innerText = `${data.wind_speed} km/h`;
                if (weatherRain) weatherRain.innerText = `${data.rainfall} mm`;
                if (weatherUV) weatherUV.innerText = `${data.uv_index}/10`;
                if (weatherStatus) weatherStatus.innerText = data.condition;
                
                // Audio Advice Button
                if (weatherAudioPlay && data.advisory_voice_url) {
                    weatherAudioPlay.onclick = function() {
                        if (window.playAgriGuardVoice) {
                            window.playAgriGuardVoice(data.advisory_voice_url);
                        }
                    };
                    weatherAudioPlay.classList.remove('disabled');
                }
                
                // Bullet advisories
                if (weatherAdvisoryList) {
                    weatherAdvisoryList.innerHTML = '';
                    data.advisory.forEach(bullet => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item bg-transparent text-white border-0 ps-0 py-1.5 d-flex align-items-start';
                        li.innerHTML = `<i class="fa-solid fa-circle-check text-success me-2 mt-1"></i> <div>${bullet}</div>`;
                        weatherAdvisoryList.appendChild(li);
                    });
                }
                
                // Forecast container
                if (forecastContainer) {
                    forecastContainer.innerHTML = '';
                    data.forecast.forEach(f => {
                        let conditionIcon = 'fa-sun text-warning';
                        if (f.condition.toLowerCase().includes('rain')) conditionIcon = 'fa-cloud-showers-water text-info';
                        else if (f.condition.toLowerCase().includes('cloud')) conditionIcon = 'fa-cloud text-secondary';
                        else if (f.condition.toLowerCase().includes('storm')) conditionIcon = 'fa-cloud-bolt text-danger';
                        
                        const forecastCol = document.createElement('div');
                        forecastCol.className = 'col text-center px-1 py-2 rounded bg-light-translucent border border-translucent';
                        forecastCol.innerHTML = `
                            <div class="small fw-semibold text-muted mb-1">${f.day}</div>
                            <div class="mb-1"><i class="fa-solid ${conditionIcon} fs-5"></i></div>
                            <div class="fw-bold">${f.temp}°C</div>
                            <div class="fs-xs text-muted">${f.humidity}%</div>
                        `;
                        forecastContainer.appendChild(forecastCol);
                    });
                }
                
                // Create live temperature chart
                createLiveTempChart(data.forecast);
                
                toggleSkeletons(false);
            })
            .catch(err => {
                console.error("Fetch weather error:", err);
                toggleSkeletons(false);
                if (weatherStatus) weatherStatus.innerText = "Error loading weather";
            });
        }
        
        function toggleSkeletons(show) {
            const skeletons = document.querySelectorAll('.weather-skeleton');
            const contents = document.querySelectorAll('.weather-content');
            
            skeletons.forEach(s => {
                if (show) s.classList.remove('d-none');
                else s.classList.add('d-none');
            });
            
            contents.forEach(c => {
                if (show) c.classList.add('d-none');
                else c.classList.remove('d-none');
            });
        }
    }
    
    function createLiveTempChart(forecastData) {
        const ctx = document.getElementById('weather-temp-chart');
        if (!ctx) return;
        
        const labels = forecastData.map(f => f.day);
        const temps = forecastData.map(f => f.temp);
        const humidities = forecastData.map(f => f.humidity);
        
        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: temps,
                        borderColor: '#ffa726',
                        backgroundColor: 'rgba(255, 167, 38, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Humidity (%)',
                        data: humidities,
                        borderColor: '#2e7d32',
                        backgroundColor: 'rgba(46, 125, 50, 0.05)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#a5d6a7', font: { family: 'Plus Jakarta Sans', size: 11 } }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a5d6a7' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a5d6a7' }
                    }
                }
            }
        });
    }

    function initializeDashboardCharts() {
        const cropChartEl = document.getElementById('crop-distribution-chart');
        if (!cropChartEl) return;
        
        // Retrieve values from data attributes injected in templates
        const tomatoCount = parseInt(cropChartEl.getAttribute('data-tomato') || 0);
        const potatoCount = parseInt(cropChartEl.getAttribute('data-potato') || 0);
        const cornCount = parseInt(cropChartEl.getAttribute('data-corn') || 0);
        const riceCount = parseInt(cropChartEl.getAttribute('data-rice') || 0);
        
        const total = tomatoCount + potatoCount + cornCount + riceCount;
        
        new Chart(cropChartEl.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Tomato', 'Potato', 'Corn', 'Rice'],
                datasets: [{
                    data: total > 0 ? [tomatoCount, potatoCount, cornCount, riceCount] : [5, 3, 4, 2], // Fallback default dummy values
                    backgroundColor: ['#e53935', '#fdd835', '#fb8c00', '#43a047'],
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a5d6a7', font: { family: 'Plus Jakarta Sans', size: 12 } }
                    }
                }
            }
        });
    }
});
