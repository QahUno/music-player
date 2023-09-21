// renderPlaylist --> done
// scroll to shrink disk --> done
// play / pause / seek --> done
// quay dia --> done
// next, prev --> done
// random --> done
// xu ly tranh lap lai trg random --> done
// next when ended --> done
// replay when ended --> done
// active current song --> done
// scroll into view --> done
// click chon playlist --> done
// save repeat/random btn when refresh --> done
// local store current song + timestamp--> done
// smart keystroke (ex spacebar = pause) --> done
// css giao dien (fix cd when scroll, background động), timestamp on progressbar
// chia module
// tu dong load nhac tu local computer, dat ten cac kieu
// upload bai hat, xoa bai hat, edit, read
// enhanced upload: nhap link yt, convert into mp3, then upload
// nghe chung (listen together, giong app superchat)
// Em làm xong hết những nhiệm vụ của bài này rồi. Em có chỉnh sửa 1 chút là em tạo 1 cái mock API để lưu thông tin của 'songs' 
// phục vụ cho việc thêm/xóa bài hát và 1 cái Web Server giả từ extensions 'Web server for Chrome' để phục vụ cho tính năng 
// tải bài hát lên từ máy tính. Nhưng em vẫn hard code URL của server, đợi sau khi học tới bài XMLHttpRequest 
// em sẽ áp dụng vô để đỡ phải hard code nữa. :(
/*
Bạn tìm hiểu thêm 2 từ khoá giúp mình là "load more" và "virtual scroll" nhé. 
Load more là kéo tới đâu tải thêm tới đấy, virtual scroll là kỹ thuật cao hơn, khó hơn, tự động remove những element 
nằm ngoài vùng nhìn thấy được của trình duyệt để giảm số lượng elements trong DOM, 
kỹ thuật này đáp ứng đc cả danh sách hàng triệu luôn nhé.
*/



// so sanh code, extract to notion, dc cmt + ss tiep, cmt yt

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const MUSICPLAYER_STORAGE_KEY = 'musicPlayerAppConfig'

const playList = $('.playlist')
const cd = $('.cd')
const cdwidth = cd.offsetWidth
const songHeading = $('.dashboard header h2')
const cdThumb = $('.cd .cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn.btn-toggle-play')
const player = $('.player')
const progressBar = $('#progress')
const nextBtn = $('.btn.btn-next')
const prevBtn = $('.btn.btn-prev')
const randomBtn = $('.btn.btn-random')
const repeatBtn = $('.btn.btn-repeat')


const App = {
  defineProperties() {
    Object.defineProperty(this, 'config', {
      get() {
        return JSON.parse(localStorage.getItem(MUSICPLAYER_STORAGE_KEY))
      }
    })

    Object.defineProperty(this, 'songs', {
      value: [
        {
          name: "Chúng ta của hiện tại",
          singer: "Sơn Tùng MTP",
          path: "./assets/music/chungta.mp3",
          image: "./assets/img/chungta.png"
        },
        {
          name: "Godfather",
          singer: "Unknown",
          path: "./assets/music/godfather.mp3",
          image: "./assets/img/godfather.jpg"
        },
        {
          name: "Lemon tree",
          singer: "Fools Garden",
          path: "./assets/music/lemon.mp3",
          image: "./assets/img/lemon.jpg"
        },
        {
          name: "Khó vẽ nụ cười",
          singer: "Đạt G",
          path: "./assets/music/nucuoi.mp3",
          image: "./assets/img/nucuoi.jpg"
        },
        {
          name: "Boulevard",
          singer: "Dan Bryd",
          path: "./assets/music/boulevard.mp3",
          image: "./assets/img/boulevard.jpg"
        },
        {
          name: "Chúng ta của hiện tại 2",
          singer: "Sơn Tùng MTP",
          path: "./assets/music/chungta.mp3",
          image: "./assets/img/chungta.png"
        },
        {
          name: "Godfather 2",
          singer: "Unknown",
          path: "./assets/music/godfather.mp3",
          image: "./assets/img/godfather.jpg"
        },
        {
          name: "Lemon tree 2",
          singer: "Fools Garden",
          path: "./assets/music/lemon.mp3",
          image: "./assets/img/lemon.jpg"
        },
        {
          name: "Khó vẽ nụ cười 2",
          singer: "Đạt G",
          path: "./assets/music/nucuoi.mp3",
          image: "./assets/img/nucuoi.jpg"
        },
        {
          name: "Boulevard 2",
          singer: "Dan Bryd",
          path: "./assets/music/boulevard.mp3",
          image: "./assets/img/boulevard.jpg"
        },
      ]
    })

    Object.defineProperty(this, 'currentIndex', {
      value: 0,
      writable: true
    })

    Object.defineProperty(this, 'currentSong', {
      get() {
        return this.songs[this.currentIndex];
      }
    })

    Object.defineProperty(this, 'isPlaying', {
      value: false,
      writable: true
    })

    Object.defineProperty(this, 'isRandom', {
      value: false,
      writable: true
    })

    Object.defineProperty(this, 'playedSongs', {
      value: [],
      writable: true
    })

    Object.defineProperty(this, 'isRepeat', {
      value: false,
      writable: true
    })
  },

  loadConfig() {
    if (this.config) {
      Object.assign(this, this.config)
    }
  },

  setConfig(key, value) {
    const newConfig = this.config || {}
    newConfig[key] = value
    localStorage.setItem(MUSICPLAYER_STORAGE_KEY, JSON.stringify(newConfig))
  },

  loadCurrentSong() {
    songHeading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
  },

  currentToNextSong() {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
  },

  currentToPrevSong() {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
  },

  currentToRandomSong() {
    const currentSongIndex = this.currentIndex
    this.playedSongs.push(currentSongIndex)
    if (this.playedSongs.length === this.songs.length) {
      this.playedSongs = []
    }
    do {
      this.currentIndex = Math.floor(Math.random() * this.songs.length)
    } while (this.currentIndex === currentSongIndex || this.playedSongs.includes(this.currentIndex))
  },

  scrollCurrentSongIntoView() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"  // k hieu horizontal???
      })
    }, 300);
  },

  renderPlaylist() {
    const htmls = this.songs.map((song, index) => {
      return `
        <div id="song-${index}" class="song ${index === this.currentIndex ? 'active' : ''}">
          <div class="thumb" style="background-image: url('${song.image}')"></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playList.innerHTML = htmls.join('')
    this.scrollCurrentSongIntoView()
  },

  activeCurrentSong() {
    $('.song.active').classList.remove('active')
    $(`#song-${this.currentIndex}`).classList.add('active')
    this.scrollCurrentSongIntoView()
  },

  autoPlayCurrentSong() {
    this.loadCurrentSong()
    this.activeCurrentSong()
    this.isPlaying = false // auto play
    playBtn.click()
  },

  handleEvents() {
    const _this = this

    // smart keystroke control (need updated!)
    onkeydown = function (e) {
      e.preventDefault()
      switch (e.code) {
        case 'Space':
          playBtn.click()
          break
        case 'ArrowLeft':
          prevBtn.click()
          break
        case 'ArrowRight':
          nextBtn.click()
          break
        default:
          console.log('default')
      }
    }

    // save current song + timestamp
    onbeforeunload = function () {
      _this.setConfig('currentIndex', _this.currentIndex)
      _this.setConfig('currentSongTimestamp', audio.currentTime)
    }

    // choose song on playlist
    playList.onclick = function (e) {
      const clickedSong = e.target.closest('.song')
      const currentSong = $('.song.active')
      if (clickedSong !== currentSong) {
        if (e.target.closest('.option')) {
          // handle option btn
          alert("Tính năng đang phát triển")
        } else {
          _this.currentIndex = Number(clickedSong.id.slice(5))
          _this.autoPlayCurrentSong()
        }
      }
    }

    // xu ly repear btn
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      repeatBtn.classList.toggle('active', _this.isRepeat)
      _this.setConfig('isRepeat', _this.isRepeat)
    }

    // auto play next song when ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        _this.isPlaying = false
        nextBtn.click()
      }
    }

    // xu ly random btn
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      randomBtn.classList.toggle('active', _this.isRandom)
      _this.setConfig('isRandom', _this.isRandom)
    }

    // xu ly next, prev btn
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.currentToRandomSong()
      } else {
        _this.currentToNextSong()
      }
      _this.autoPlayCurrentSong()
    }

    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.currentToRandomSong()
      } else {
        _this.currentToPrevSong()
      }
      _this.autoPlayCurrentSong()
    }

    // xu ly quay dia
    const cdThumbAnimation = cdThumb.animate([
      { transform: 'rotate(360deg)' }
    ], {
      duration: 10000,
      iterations: Infinity
    })

    cdThumbAnimation.pause()

    audio.addEventListener('play', () => {
      cdThumbAnimation.play()
    })

    audio.addEventListener('pause', () => {
      cdThumbAnimation.pause()
    })

    // xu ly keo chuot, thu nho dia cd
    document.onscroll = function () {
      const scrollHeight = window.scrollY || document.documentElement.scrollTop
      let newWidth = Math.max(cdwidth - scrollHeight, 0)
      cd.style.width = newWidth + 'px'
      cd.style.opacity = newWidth / cdwidth
    }

    // xu ly click de play/pause song
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause()
      }
      else {
        audio.play()
      }
      _this.isPlaying = !_this.isPlaying
      player.classList.toggle('playing', _this.isPlaying)
    }

    // xu ly progress bar update theo bai hat
    audio.ontimeupdate = function () {
      progressBar.value = audio.currentTime ? Math.floor(audio.currentTime / audio.duration * 100) : 0
      // when currentTime = 0, duration = NaN
    }

    // xu ly seek time song
    progressBar.oninput = function (e) {
      audio.currentTime = progressBar.value / 100 * audio.duration
    }
  },

  renderFromConfig() {
    audio.currentTime = this.config.currentSongTimestamp || 0
    repeatBtn.classList.toggle('active', this.isRepeat)
    randomBtn.classList.toggle('active', this.isRandom)
  },

  start() {
    this.defineProperties()
    this.loadConfig()
    this.loadCurrentSong()
    this.renderFromConfig()
    this.renderPlaylist()
    this.handleEvents()
  }
}

App.start()



/*
5. Thêm chức năng điều chỉnh âm lượng, lưu vị trí âm lượng người dùng đã chọn. Mặc định 100%

<!--Adjust Volume -->
      <div class="container">
        <div class="btn btn-down-volume">
          <i class="fa-solid fa-subtract"></i>
        </div>

        <div class="btn btn-volume">
          <i class="fa-solid fa-volume-high "></i>
        </div>
        <div class="btn btn-up-volume">
          <i class="fa-solid fa-plus"></i>
        </div>

      </div>

      <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="0">
      <!-- <span class="volume-value">50%</span> -->
Thêm các icon
const app = {
        currentIndex: 0,
        isPlaying: false,
        isRandom: false,
        isRepeat: false,
        playedIndexes: [],
        currentVolume: 0,
Thêm biến currentVolume để lưu âm lượng hiện tại
// Xử lý tăng giảm âm lượng
          upVolumeBtn.onclick = function () {
            console.log(audio.volume)
            if (audio.volume < 1.0) {
              
              audio.volume = parseFloat((audio.volume + 0.1).toFixed(1));
              volumeSlider.value = audio.volume;
              console.log(volumeSlider)
              _this.setConfig('currentVolume', volumeSlider.value)
            }
          }

          downVolumeBtn.onclick = function () {
            console.log(audio.volume)
            if (audio.volume > 0.0) {
              audio.volume = parseFloat((audio.volume - 0.1).toFixed(1));
              volumeSlider.value = audio.volume;
              console.log(volumeSlider)
              _this.setConfig('currentVolume', volumeSlider.value)
            }
          }

          // Cập nhật giá trị volume slider khi giá trị volume bị thay đổi
          audio.onvolumechange = function () {
            volumeSlider.value = audio.volume;
          }

thêm 2 dong ở hàm loadConfig
loadConfig: function () {
          this.isRandom = this.config.isRandom
          this.isRepeat = this.config.isRepeat
          this.currentIndex = this.config.currentIndex
          this.playedIndexes.push(this.config.currentIndex)
          volumeSlider.value = this.config.currentVolume
          audio.volume = this.config.currentVolume
          //Object.assign(this, this.config)
        },
*/