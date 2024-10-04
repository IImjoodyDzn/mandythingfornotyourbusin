function cacheVideos() {
    // Check if the video is already cached
    return caches.match('video1.mp4').then((response) => {
        if (response) {
            console.log('اطلع من هنا احسن لا اسويها بيك دكة ناقصة تمام؟');
            return response.blob().then((videoBlob) => {
                return URL.createObjectURL(videoBlob); // Return the cached video URL
            });
        } else {
            // Fallback to fetching the video if not cached
            return fetchAndCacheVideo('video1.mp4');
        }
    });
}

function fetchAndCacheVideo(source) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', source, true);
        xhr.responseType = 'blob';

        xhr.onprogress = function(event) {
            if (event.lengthComputable) {
                const percentage = Math.round((event.loaded / event.total) * 100);
                updateLoadingProgress(percentage);
            }
        };

        xhr.onload = function() {
            if (xhr.status === 200) {
                const videoBlob = xhr.response;
                const videoURL = URL.createObjectURL(videoBlob);

                // Cache the video in the service worker
                caches.open('video-cache-v1').then((cache) => {
                    cache.put(source, new Response(videoBlob));
                });

                resolve(videoURL);
            } else {
                reject(`Failed to load video: ${xhr.status}`);
            }
        };

        xhr.onerror = function() {
            reject(`Network error while fetching video`);
        };

        xhr.send();
    });
}

function updateLoadingProgress(percentage) {
    const loadingBar = document.getElementById('loading-bar');
    const loadingPercentage = document.getElementById('loading-percentage');

    loadingBar.style.width = percentage + '%';
    loadingPercentage.textContent = percentage + '%';
}

function init() {
    const introMessage = document.getElementById('intro-message');
    const startButton = document.getElementById('start-button');
    const loadingScreen = document.getElementById('loading-screen');
    const videoContainer = document.querySelector('.video-container');
    const video = document.getElementById('video');
    let isPlaying = false;

    startButton.addEventListener('click', () => {
        introMessage.classList.add('hide');
        loadingScreen.classList.remove('hide');

        // Preload and cache videos
        cacheVideos().then((videoURL) => {
            loadingScreen.classList.add('hide');
            videoContainer.classList.remove('hide');

            // Set the cached video URL as the source for the video element
            video.src = videoURL;

            // Play the video once it's fully cached
            if (!isPlaying) {
                video.play();
                isPlaying = true;
            }
        });
    });

    video.addEventListener('ended', () => {
        video.pause();
        video.currentTime = video.duration;
    });
}

// Register the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('شبيك شتريد تشوف هنا يعني؟: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

window.onload = init;
