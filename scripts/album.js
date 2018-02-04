// Example Album
var albumPicasso = {
    title: 'The Colors',
    artist: 'Pablo Picasso',
    label: 'Cubism',
    year: '1881',
    albumArtUrl: 'assets/images/album_covers/01.png',
    songs: [
        { title: 'Blue', duration: '4:26' },
        { title: 'Green', duration: '3:14' },
        { title: 'Red', duration: '5:01' },
        { title: 'Pink', duration: '3:21'},
        { title: 'Magenta', duration: '2:15'}
    ]
};

// Another Example Album
var albumMarconi = {
    title: 'The Telephone',
    artist: 'Guglielmo Marconi',
    label: 'EM',
    year: '1909',
    albumArtUrl: 'assets/images/album_covers/20.png',
    songs: [
        { title: 'Hello, Operator?', duration: '1:01' },
        { title: 'Ring, ring, ring', duration: '5:01' },
        { title: 'Fits in your pocket', duration: '3:21'},
        { title: 'Can you hear me now?', duration: '3:14' },
        { title: 'Wrong phone number', duration: '2:15'}
    ]
};

var albumCage = {
    title: 'Free the Sunset',
    artist: 'Vanessa Cage',
    label: 'Universal Music Group',
    year: '2017',
    albumArtUrl: 'assets/images/album_covers/03.png',
    songs: [
        { title: 'Intro', duration: '1:36' },
        { title: 'Summertime', duration: '4:36' },
        { title: 'The Hamptons', duration: '3:54'},
        { title: 'Bridge to...', duration: '2:21' },
        { title: 'Bliss', duration: '3:18'},
        { title: 'I Need You', duration: '4:19'},
        { title: 'Call Me Crazy', duration: '4:32'},
        { title: 'Nitrogen', duration: '3:06'},
        { title: 'Owner', duration: '2:15'},
        { title: 'Ice Cream', duration: '3:48'},
        { title: 'Dangerous', duration: '4:15'}
    ]
};

// Third Example Album

var createSongRow = function(songNumber, songName, songLength) {
    var template =
       '<tr class="album-view-song-item">'
     + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
     + '  <td class="song-item-title">' + songName + '</td>'
     + '  <td class="song-item-duration">' + songLength + '</td>'
     + '</tr>'
     ;

    return template;
};

// #1
var albumTitle = document.getElementsByClassName('album-view-title')[0];
var albumArtist = document.getElementsByClassName('album-view-artist')[0];
var albumReleaseInfo = document.getElementsByClassName('album-view-release-info')[0];
var albumImage = document.getElementsByClassName('album-cover-art')[0];
var albumSongList = document.getElementsByClassName('album-view-song-list')[0];

var setCurrentAlbum = function(album) {
    // #2
    albumTitle.firstChild.nodeValue = album.title;
    albumArtist.firstChild.nodeValue = album.artist;
    albumReleaseInfo.firstChild.nodeValue = album.year + ' ' + album.label;
    albumImage.setAttribute('src', album.albumArtUrl);

    // #3
    albumSongList.innerHTML = '';

    // #4
    for (var i = 0; i < album.songs.length; i++) {
        albumSongList.innerHTML += createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    }
};

// Elements we'll be adding listeners to
var songListContainer = document.getElementsByClassName('album-view-song-list')[0];
var songRows = document.getElementsByClassName('album-view-song-item');

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';

window.onload = function() {
    setCurrentAlbum(albumPicasso);

    // Add event listener to album art
    var albums = [albumPicasso,albumMarconi,albumCage];
    var i = 1;
    albumImage.addEventListener('click',function (event) {
      setCurrentAlbum(albums[i]);
      i++;
      if (i === albums.length) {
        i = 0;
      }
    });

    songListContainer.addEventListener('mouseover', function(event) {
      // Only target individual song rows during event delegation
      if (event.target.parentElement.className === 'album-view-song-item') {
          // Change the content from the number to the play button's HTML
          event.target.parentElement.querySelector('.song-item-number').innerHTML = playButtonTemplate;
      }
    });

    for (var i = 0; i < songRows.length; i++) {
      songRows[i].addEventListener('mouseleave', function(event) {
        // Revert the content back to the number
        // Selects first child element, which is the song-item-number element
        this.children[0].innerHTML = this.children[0].getAttribute('data-song-number');
      });
    }
};
