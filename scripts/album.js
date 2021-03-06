//set song from song number
var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }

  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
  });

  setVolume(currentVolume);
};

//seek during song
var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
}

//set volume
var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

//get song number
var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
};

// set current and total time
var setCurrentTimeInPlayerBar = function(currentTime) {
  if (currentSoundFile) {
    $('.current-time').text(filterTimeCode(currentTime));
  }
};

var setTotalTimeInPlayerBar = function(totalTime) {
  if (currentSoundFile) {
    $('.total-time').text(filterTimeCode(totalTime));
  }
};

//time into seconds
var filterTimeCode = function(timeInSeconds) {
  if (parseFloat(Math.floor(((timeInSeconds/60)-Math.floor(timeInSeconds/60))*60)) < 10) {
    return parseFloat(Math.floor(timeInSeconds/60)) + ":0" + parseFloat(Math.floor(((timeInSeconds/60)-Math.floor(timeInSeconds/60))*60))
  } else {
    return parseFloat(Math.floor(timeInSeconds/60)) + ":" + parseFloat(Math.floor(((timeInSeconds/60)-Math.floor(timeInSeconds/60))*60))
  }
};

//album template
var createSongRow = function(songNumber, songName, songLength) {
    var template =
       '<tr class="album-view-song-item">'
     + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
     + '  <td class="song-item-title">' + songName + '</td>'
     + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
     + '</tr>'
     ;

     var $row = $(template);

     var clickHandler = function() {
       var songNumber = parseInt($(this).attr('data-song-number'));

     	 if (currentlyPlayingSongNumber !== null) {
     		 // Revert to song number for currently playing song because user started playing new song.
     		 var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
     		 currentlyPlayingCell.html(currentlyPlayingSongNumber);
     	 }
     	 if (currentlyPlayingSongNumber !== songNumber) {
     		 // Switch from Play -> Pause button to indicate new song is playing.
         setSong(songNumber);
         currentSoundFile.play();
         updateSeekBarWhileSongPlays();
         $('.volume .fill').width(currentVolume + '%');
         $('.volume .thumb').css({left: currentVolume + '%'});
         $(this).html(pauseButtonTemplate);
         updatePlayerBarSong();
       } else if (currentlyPlayingSongNumber === songNumber) {
     		 // Switch from Pause -> Play button to pause currently playing song.
         if (currentSoundFile.isPaused()) {
           $(this).html(pauseButtonTemplate);
           $('.main-controls .play-pause').html(playerBarPauseButton);
           currentSoundFile.play();
           updateSeekBarWhileSongPlays();
         } else {
           $(this).html(playButtonTemplate);
           $('.main-controls .play-pause').html(playerBarPlayButton);
           currentSoundFile.pause();
         }
     	 }
     };

     var onHover = function(event) {
       var songNumberCell = $(this).find('.song-item-number');
       var songNumber = parseInt(songNumberCell.attr('data-song-number'));

       if (songNumber !== currentlyPlayingSongNumber) {
           songNumberCell.html(playButtonTemplate);
       }
     };

     var offHover = function(event) {
       var songNumberCell = $(this).find('.song-item-number');
       var songNumber = parseInt(songNumberCell.attr('data-song-number'));

       if (songNumber !== currentlyPlayingSongNumber) {
           songNumberCell.html(songNumber);
       }
       console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
     };

     $row.find('.song-item-number').click(clickHandler);
     $row.hover(onHover, offHover);
     return $row;

};

var $albumTitle = $('.album-view-title');
var $albumArtist = $('.album-view-artist');
var $albumReleaseInfo = $('.album-view-release-info');
var $albumImage = $('.album-cover-art');
var $albumSongList = $('.album-view-song-list');

//set current album displayed on page
var setCurrentAlbum = function(album) {
    currentAlbum = album;
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
      var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
      $albumSongList.append($newRow);
    }
};

//set seek bar
var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(currentSoundFile.getTime());
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
   var offsetXPercent = seekBarFillRatio * 100;

   offsetXPercent = Math.max(0, offsetXPercent);
   offsetXPercent = Math.min(100, offsetXPercent);

   var percentageString = offsetXPercent + '%';
   $seekBar.find('.fill').width(percentageString);
   $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
     var $seekBars = $('.player-bar .seek-bar');

     $seekBars.click(function(event) {
         var offsetX = event.pageX - $(this).offset().left;
         var barWidth = $(this).width();

         var seekBarFillRatio = offsetX / barWidth;

         if ($(this).parent().attr('class') == 'seek-control') {
             seek(seekBarFillRatio * currentSoundFile.getDuration());
         } else {
             setVolume(seekBarFillRatio * 100);
         }

         updateSeekPercentage($(this), seekBarFillRatio);
     });

     $seekBars.find('.thumb').mousedown(function(event) {
         var $seekBar = $(this).parent();

         $(document).bind('mousemove.thumb', function(event){
              var offsetX = event.pageX - $seekBar.offset().left;
              var barWidth = $seekBar.width();
              var seekBarFillRatio = offsetX / barWidth;

              if ($seekBar.parent().attr('class') == 'seek-control') {
                  seek(seekBarFillRatio * currentSoundFile.getDuration());
              } else {
                  setVolume(seekBarFillRatio * 100);
              }

              updateSeekPercentage($seekBar, seekBarFillRatio);
          });

          $(document).bind('mouseup.thumb', function() {
              $(document).unbind('mousemove.thumb');
              $(document).unbind('mouseup.thumb');
          });
     });
 };

//track index of currently playing song
var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

//set player bar to currently playing song
var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);
  currentSoundFile.bind('timeupdate', function(event) {
      setTotalTimeInPlayerBar(currentSoundFile.getDuration());
  });
};

//update song information for next button
var nextSong = function() {
  //increment index
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex++;
  //wrap last song to first song
  if (currentSongIndex >= currentAlbum.songs.length) {
      currentSongIndex = 0;
  }
  // Save the last song number before changing it
  var lastSongNumber = currentlyPlayingSongNumber
  //set next song to current song
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  //update player bar
  updatePlayerBarSong();
  //update last song with number
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  $lastSongNumberCell.html(lastSongNumber);
  //update next song with pause button
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  $nextSongNumberCell.html(pauseButtonTemplate);
};

//update song information for previous button
var previousSong = function() {
  //decrement index
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex--;
  //wrap first song to last song
  if (currentSongIndex < 0) {
      currentSongIndex = currentAlbum.songs.length - 1;
  }
  // Save the last song number before changing it
  var lastSongNumber = currentlyPlayingSongNumber
  //set previous song to current song
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  //update player bar
  updatePlayerBarSong();
  //update last song with number
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  $lastSongNumberCell.html(lastSongNumber);
  //update previous song with pause button
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  $previousSongNumberCell.html(pauseButtonTemplate);
};

//toggle play from player bar
var togglePlayFromPlayerBar = function() {
  if (currentSoundFile.isPaused()) {
    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    currentlyPlayingCell.html(pauseButtonTemplate);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
  } else {
    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    currentlyPlayingCell.html(playButtonTemplate);
    $('.main-controls .play-pause').html(playerBarPlayButton);
    currentSoundFile.pause();
  }
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

//store beginning states
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playButton = $('.main-controls .play-pause');

//display album on load
$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playButton.click(togglePlayFromPlayerBar);
    setupSeekBars();
});
