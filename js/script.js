let currentSong = new Audio();
let Songs = [];
let currentIndex = 0;

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

async function fetchData() {
    try {
        let response = await fetch('songs.json');
        if (response.ok) {
            let songsData = await response.json();
            return songsData.map(song => {
                if (!song.startsWith('http')) {
                    return "Song/" + song;
                }
                return song;
            });
        } else {
            throw new Error('songs.json not found');
        }
    } catch (error) {
        console.warn("Using fallback songs due to error:", error);

        
        const hardcodedSongs = [
            "Song/Adada-Mazhaida.mp3",
            "Song/Adiye-Sakkarakatti.mp3",
            "Song/Anbe-enAnbe.mp3",
            "Song/Kurumugil.mp3",
            "Song/Nee-Kavithaigala.mp3",
            "Song/Nillayo.mp3",
            "Song/PookalPookum.mp3",
            "Song/Tamilselvi.mp3"
        ];
        return hardcodedSongs;
    }
}

const playMusic = (track, pause = false) => {
    if (!track) {
        console.error("Invalid track URL");
        return;
    }

    currentSong.src = track;
    currentIndex = Songs.indexOf(track);

    if (!pause) {
        currentSong.play().catch(e => {
            console.log("Error playing audio:", e);
            alert("Could not play this song. Please check if the file exists and is accessible.");
        });
    }

    const play = document.getElementById('play');
    if (play) play.src = "img/pause.svg";

    let songName = "Unknown";
    try {
        songName = decodeURI(track.split('/').pop().replace('.mp3', ''));
    } catch (e) {
        console.error("Error parsing song name from track:", track);
    }

    const songinfoEl = document.querySelector('.songinfo');
    const songtimeEl = document.querySelector('.songtime');

    if (songinfoEl) songinfoEl.innerHTML = songName;
    if (songtimeEl) songtimeEl.innerHTML = "00:00 / 00:00";
};

async function main() {
    try {
        Songs = await fetchData();
        if (Songs.length === 0) {
            const songUl = document.querySelector('.songList ul');
            if (songUl) {
                songUl.innerHTML = '<li style="color: red; padding: 20px;">No songs found. Please add songs.json or MP3 files in the Song/ folder.</li>';
            }
            return;
        }

        playMusic(Songs[0], true);

        const songUl = document.querySelector('.songList ul');
        if (songUl) {
            songUl.innerHTML = '';
            Songs.forEach((song, i) => {
                const name = decodeURI(song.split('/').pop().replace('.mp3', ''));
                songUl.innerHTML += `<li data-index="${i}">
                    <img src="img/music.svg" class="invert">
                    <div class="info">
                        <div>${name}</div>
                    </div>
                    <span>Play Now</span>
                    <img src="img/play.svg" class="invert">
                </li>`;
            });

            Array.from(songUl.getElementsByTagName('li')).forEach(e => {
                e.addEventListener("click", () => {
                    const index = parseInt(e.getAttribute('data-index'));
                    if (Songs[index]) playMusic(Songs[index]);
                });
            });
        }

        const play = document.getElementById('play');
        if (play) {
            play.addEventListener("click", () => {
                if (currentSong.paused) {
                    currentSong.play().catch(e => alert("Audio error: " + e));
                    play.src = "img/pause.svg";
                } else {
                    currentSong.pause();
                    play.src = "img/play.svg";
                }
            });
        }

        currentSong.addEventListener('timeupdate', () => {
            const currentTime = formatTime(currentSong.currentTime);
            const duration = formatTime(currentSong.duration);
            const songtimeEl = document.querySelector('.songtime');
            const circleEl = document.querySelector('.circle');

            if (songtimeEl) songtimeEl.innerHTML = `${currentTime} / ${duration}`;
            if (circleEl && currentSong.duration) {
                const percent = (currentSong.currentTime / currentSong.duration) * 100;
                circleEl.style.left = percent + '%';
            }
        });

        const seekbar = document.querySelector('.seekbar');
        if (seekbar) {
            seekbar.addEventListener('click', e => {
                const rect = e.target.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                const circleEl = document.querySelector('.circle');
                if (circleEl) circleEl.style.left = percent + '%';
                if (currentSong.duration) currentSong.currentTime = (currentSong.duration * percent) / 100;
            });
        }

        const previous = document.getElementById('previous');
        if (previous) {
            previous.addEventListener("click", () => {
                playMusic(Songs[(currentIndex - 1 + Songs.length) % Songs.length]);
            });
        }

        const next = document.getElementById('next');
        if (next) {
            next.addEventListener("click", () => {
                playMusic(Songs[(currentIndex + 1) % Songs.length]);
            });
        }

        const volumeInput = document.querySelector('.range input[type="range"]');
        if (volumeInput) {
            volumeInput.addEventListener("input", e => {
                currentSong.volume = parseInt(e.target.value) / 100;
            });

            currentSong.volume = 0.5;
            volumeInput.value = 50;
        }

        currentSong.addEventListener('ended', () => {
            if (next) next.click();
        });

        const hamburger = document.querySelector('.hamburger');
        const leftPanel = document.querySelector('.left');
        const closeBtn = document.querySelector('.close img');

        if (hamburger && leftPanel) {
            hamburger.addEventListener('click', () => {
                leftPanel.style.left = '0';
            });
        }

        if (closeBtn && leftPanel) {
            closeBtn.addEventListener('click', () => {
                leftPanel.style.left = '-130%';
            });
        }

    } catch (error) {
        console.error("Main function error:", error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
