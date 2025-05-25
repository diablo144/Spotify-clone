let currentSong = new Audio();
let Songs;

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

async function fetchData() {
    try {
        let a = await fetch(`http://127.0.0.1:5500/Song/`);
        let b = await a.text();
        let div = document.createElement("div");
        div.innerHTML = b;
        let data = div.getElementsByTagName('li');
        let Songs = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const list = element.querySelector('a');
            if (list && list.href.endsWith('.mp3')) {
                Songs.push(list.href);
            }
        }
        return Songs;
    } catch (error) {
        console.log("Error" + error);
        return [];
    }
}

const playMusic = (track,pause = false) => {
    currentSong.src = track;
    

    if(!pause){

        currentSong.play();
    }
    
    play.src = "img/pause.svg";
    const songName = decodeURI(track.split('/').pop().replace('.mp3',' '))
    document.querySelector('.songinfo').innerHTML = songName;
    document.querySelector('.songtime').innerHTML = "00:00";
}

async function main() {
     Songs = await fetchData();
    playMusic(Songs[2], true);
    
    
    let songUl = document.querySelector('.songList').getElementsByTagName("ul")[0];
    for (const song of Songs) {
        let name = song.split('/').pop().replaceAll('%20', ' ').replace('.mp3', ' ');
        songUl.innerHTML += `<li>
                                <img src="img/music.svg" class="invert">
                                <div class="info">
                                    <div> ${name}</div>
                                </div>
                                <span>Play Now</span>
                                <img src="img/play.svg" class="invert">
                            </li>`;
    }
    Array.from(document.querySelector(".songList").getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {
           let clickedName = e.querySelector('.info').firstElementChild.innerHTML.trim();
            let clickedTrack = Songs.find(song => {
            let songName = decodeURI(song.split('/').pop().replace('.mp3', '').trim());
            return songName === clickedName;
});

if (clickedTrack) {
    playMusic(clickedTrack);
}

        });
    });
    const play = document.getElementById('play');
    play.addEventListener("click", () => {
                      if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });
    currentSong.addEventListener('timeupdate', () => {
        const currentTime = formatTime(currentSong.currentTime);
        const duration = formatTime(currentSong.duration);
        document.querySelector('.songtime').innerHTML = `${currentTime} / ${duration}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    });


    document.querySelector('.seekbar').addEventListener('click',e=>{
        document.querySelector('.circle').style.left = (e.offsetX/e.target.getBoundingClientRect().width )*100 +'%';
        let percent = (e.offsetX/e.target.getBoundingClientRect().width )*100;
        currentSong.currentTime = ((currentSong.duration)*percent)/100
      
    })

    
    previous.addEventListener("click",()=>{
         let index = Songs.indexOf(currentSong.src)
         if((index-1)>=0){
            playMusic(Songs[index-1])
         }
    })
    
    next.addEventListener("click",()=>{
        let index = Songs.indexOf(currentSong.src)
        if((index + 1) <=Songs.length){
            playMusic(Songs[index+1])
        }
    })

    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener("click",(e)=>{
        
        currentSong.volume = parseInt(e.target.value)/100
    })
}
main()
