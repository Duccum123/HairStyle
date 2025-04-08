import { articles } from "./artical.js";
import { chooseHair } from "./hairStyle.js";
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tryNowBtn = document.getElementById('tryNowBtn');
    const cameraSection = document.getElementById('cameraSection');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const photoPreview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('previewImg');
    const loadingSection = document.getElementById('loadingSection');
    const resultsSection = document.getElementById('resultsSection');
    const hairstyleResults = document.getElementById('hairstyleResults');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    const trendingArticles = document.getElementById('trendingArticles');
    
    
    
    // Sample hairstyle recommendations
    let sampleHairstyles = [];
    
    // Populate trending articles
    articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300';
        articleCard.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${article.title}</h3>
                <p class="text-gray-600 mb-4">${article.excerpt}</p>
                <a href="#" class="text-indigo-600 font-medium hover:underline">Read More</a>
            </div>
        `;
        trendingArticles.appendChild(articleCard);
    });
    
    // Show camera section when "Try Now" is clicked
    tryNowBtn.addEventListener('click', function() {
        cameraSection.classList.remove('hidden');
        cameraSection.scrollIntoView({ behavior: 'smooth' });
        startCamera();
    });
    
    // Start camera function
    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err) {
                console.error("An error occurred: " + err);
                alert("Could not access the camera. Please ensure you've granted camera permissions.");
            });
    }
    let imageBase64 = null
    // Capture photo
    captureBtn.addEventListener('click', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stop video stream
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        // Show captured photo
        previewImg.src = canvas.toDataURL('image/png');
        photoPreview.classList.remove('hidden');
        captureBtn.style.display = 'none';
        retakeBtn.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');

        imageBase64 = canvas.toDataURL('image/png');

    });
    
    // Retake photo
    retakeBtn.addEventListener('click', function() {
        photoPreview.classList.add('hidden');
        captureBtn.style.display = 'block';
        retakeBtn.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        startCamera();
    });
    
    // Analyze photo (simulate API call)
    analyzeBtn.addEventListener('click', function() {
        photoPreview.classList.add('hidden');
        retakeBtn.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
    

        // Tách phần base64 từ src
        const base64Data = imageBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' }); // hoặc 'image/png' nếu cần

        // Tạo FormData và gửi
        const formData = new FormData();
        formData.append('file', blob, 'photo.jpg');

        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error("API Error");
            return response.json();
        })
        .then(data => {
            console.log("Kết quả từ API:", data);
            loadingSection.classList.add('hidden');
            
            
            // Hiển thị kết quả
            const resultImg = document.getElementById('resultImg');
            const resultSection = document.getElementById('resultSection');
            const predictedLabel = document.getElementById('predictedLabel');

            resultImg.src = data.image_with_contour;
            predictedLabel.innerText = `Bạn thuộc khuôn mặt: ${data.predicted_shape}`;
            resultSection.classList.remove('hidden');

            showResults(data.predicted_shape); // truyền data từ API để hiển thị nếu cần
        })
        .catch(err => {
            console.error("Lỗi gửi ảnh:", err);
            loadingSection.classList.add('hidden');
            alert("Có lỗi xảy ra khi gửi ảnh.");
        });


    });
    
    // Show hairstyle recommendations
    function showResults(shape) {
        sampleHairstyles = chooseHair(shape);
        cameraSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Clear previous results
        hairstyleResults.innerHTML = '';
        
        // Add sample results
        sampleHairstyles.forEach(style => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card bg-white rounded-lg overflow-hidden shadow-md';
            
            // Add tags HTML
            const tagsHTML = style.tags.map(tag => 
                `<span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mr-1">${tag}</span>`
            ).join('');
            
            resultCard.innerHTML = `
                <img src="${style.image}" alt="${style.name}" class="w-full h-160 object-cover">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-semibold">${style.name}</h3>
                        <span class="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            ${style.suitability}
                        </span>
                    </div>
                    <p class="text-gray-600 mb-4">${style.description}</p>
                    <div class="mb-4">
                        ${tagsHTML}
                    </div>
                    <button class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors">
                        View Styling Tips
                    </button>
                </div>
            `;
            
            hairstyleResults.appendChild(resultCard);
            
            // Animate cards in sequence
            setTimeout(() => {
                resultCard.classList.add('show');
            }, 200 * sampleHairstyles.indexOf(style));
        });
    }
    
    // Try another photo
    tryAgainBtn.addEventListener('click', function() {
        resultsSection.classList.add('hidden');
        cameraSection.classList.remove('hidden');
        startCamera();
    });
    
  
});