document.addEventListener('DOMContentLoaded', () => {
    const selectMaleBtn = document.getElementById('select-male');
    const selectFemaleBtn = document.getElementById('select-female');
    const avatarImage = document.getElementById('avatar-image');
    const talkBtn = document.getElementById('talk-btn');
    const statusText = document.getElementById('status-text');
    const indicator = document.getElementById('indicator');

    let selectedTutor = 'male';

    const avatars = {
        male: 'https://i.ibb.co/dG7ZJzZ/male-tutor.png',
        female: 'https://i.ibb.co/yQxV4Q5/female-tutor.png'
    };

    selectMaleBtn.addEventListener('click', () => {
        selectedTutor = 'male';
        avatarImage.src = avatars.male;
        selectMaleBtn.classList.add('active');
        selectFemaleBtn.classList.remove('active');
    });

    selectFemaleBtn.addEventListener('click', () => {
        selectedTutor = 'female';
        avatarImage.src = avatars.female;
        selectFemaleBtn.classList.add('active');
        selectMaleBtn.classList.remove('active');
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        statusText.textContent = "Maaf, browser Anda tidak mendukung fitur suara.";
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;

    talkBtn.addEventListener('click', () => {
        statusText.textContent = "Mendengarkan...";
        indicator.classList.add('active');
        try {
            recognition.start();
        } catch(e) {
            statusText.textContent = "Error: Mikrofon sudah aktif.";
            indicator.classList.remove('active');
        }
    });

    recognition.onresult = (event) => {
        const userInput = event.results[0][0].transcript;
        statusText.textContent = `Anda berkata: "${userInput}"`;
        getAIResponse(userInput);
    };

    recognition.onspeechend = () => {
        recognition.stop();
        indicator.classList.remove('active');
    };
    
    recognition.onerror = (event) => {
        statusText.textContent = "Tidak ada suara terdeteksi. Coba lagi.";
        indicator.classList.remove('active');
    };

    async function getAIResponse(userInput) {
        statusText.textContent = "AI sedang berpikir...";
        
        // GANTI URL INI DENGAN URL BACKEND ANDA
        const backendUrl = 'https://proyek-ai-backend-production.up.railway.app/api/chat';

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput, tutor: selectedTutor })
            });

            if (!response.ok) { throw new Error('Gagal menghubungi server AI.'); }

            const data = await response.json();
            statusText.textContent = data.text_response;
            indicator.classList.add('active');
            
            const audio = new Audio(data.audio_url);
            audio.play();

            audio.onended = () => {
                indicator.classList.remove('active');
                statusText.textContent = "Silakan tekan tombol untuk berbicara lagi.";
            };
        } catch (error) {
            console.error("Error:", error);
            statusText.textContent = "Maaf, server AI tidak aktif. Pastikan backend sudah di-deploy.";
        }
    }
});