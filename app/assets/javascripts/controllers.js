var pulpApp = angular.module('pulpApp', []);

pulpApp.controller('AppController', function($scope, $http) {
    
    var player = document.getElementById('player');
    
    $scope.selected = {
        artist: null,
        album: null,
        song: null,
        draggingSong: null
    };
    
    $scope.player = {
        playing: false
    };
    
    $scope.data = {
        artists: [],
        albums: [],
        songs: []
    };
    
    $scope.playlist = {
        songs: [],
        selected: null,
        add: function(song) {
            $http.get('/songs/'+song.id).success(function(data) {
                song = data
                $scope.playlist.songs.push(song);
                if ($scope.playlist.songs.length == 1) {
                    $scope.selected.song = $scope.playlist.songs[0];
                    $scope.player.playing = true;
                }
            });
        },
        remove: function (song) {
            var index = $scope.playlist.songs.indexOf(song);
            if (index > -1) {
                $scope.playlist.songs.splice(index, 1);
            }
            if ($scope.selected.song == song) {
                $scope.selected.song = null;
                $scope.player.playing = false;
            }
        },
        clear: function () {
            $scope.selected.song = null;
            $scope.player.playing = false;
            $scope.playlist.songs = [];
        }
    }
    
    $scope.addAlbum = function(album) {
        $http.get('/albums/'+album.id+'/songs').success(function(data) {
            for (var i in data) {
                $scope.playlist.add(data[i]);
            }
        });
    }
    
    // $scope.data.artists     = [];
    // $scope.data.albums      = [];
    // $scope.data.songs       = [];
    // $scope.playlist.songs    = [];
    
    // initial load
    $http.get('/artists').success(function(data) {
        $scope.data.artists = data;
    });
    
    $scope.getAlbums = function(id) {
        $scope.selected.artist = this.artist;
        
        $http.get('/artists/'+id+'/albums').success(function(data) {
            $scope.data.albums = data;
        });
        $http.get('/artists/'+id+'/songs').success(function(data) {
            $scope.data.songs = data;
        });
    }
    
    $scope.getSongs = function(id) {
        $scope.selected.album = this.album;
        
        $http.get('/albums/'+id+'/songs').success(function(data) {
            $scope.data.songs = data;
        });
    }
    
    $scope.player.playSong = function(song) {
        $scope.selected.song = song;
        $scope.player.playing = true;
    }
    
    $scope.player.nextSong = function() {
        var index = $scope.playlist.songs.indexOf($scope.selected.song);
        if (index < $scope.playlist.songs.length) {
            $scope.selected.song = $scope.playlist.songs[index+1];
        } else {
            $scope.player.playing = false;
        }
    }
    
    $scope.player.prevSong = function() {
        var index = $scope.playlist.songs.indexOf($scope.selected.song);
        if (index >= 1) {
            $scope.selected.song = $scope.playlist.songs[index-1];
        }
    }
    
    $scope.player.togglePlay = function() {
        $scope.player.playing ? player.pause() : player.play();
        $scope.player.playing = !$scope.player.playing;
    }
    
    Lx(window).on('keypress', function(e) {
        console.log(e);
        if (e.keyCode == 32) {
            $scope.player.togglePlay();
            $scope.$apply();
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    });
    
    
});

pulpApp.directive('draggable', function() {
    var dragProxy = Lx('li').make({
        className: 'dragProxy'
    }).on('dragover', function(e) {
        e.preventDefault();
        return false;
    });
    
    var overSong = null;
    
    return function($scope, element) {
        element.bind('dragstart', function(e) {
            Lx(this).addClass('dragging');
            $scope.selected.draggingSong = $scope.song;
        });

        element.bind('dragover', function(e) {
            var dim = this.getBoundingClientRect();
            
            if (e.pageY > dim.top + (dim.height / 2)) {
                dragProxy.insertBefore(this);
                overSong = $scope.song;
            } else {
                dragProxy.insertAfter(this);
                overSong = $scope.song;
            }
        });
        
        element.bind('dragend', function(e) {
            Lx(this).rmClass('dragging');
            dragProxy.rm();
        });
        
        element.bind('dragover', function(e) {
            e.preventDefault();
            return false;
        });
        
        dragProxy.on('drop', function(e) {
            var dim = this.getBoundingClientRect();
            
            var index = $scope.playlist.songs.indexOf(overSong) -1;
            // console.log($scope.song, $scope.selected.draggingSong);
            // console.log($scope.playlist.songs);
            $scope.playlist.songs.splice($scope.playlist.songs.indexOf($scope.selected.draggingSong), 1);
            $scope.$apply();
            
            if (index < 1) index = 0;
            if (index > $scope.playlist.songs.length) index = $scope.playlist.songs.length;
            if (e.pageY > dim.top + (dim.height / 2)) {
                $scope.playlist.songs.splice(index+1, 0, $scope.selected.draggingSong);
            } else {
                $scope.playlist.songs.splice(index, 0, $scope.selected.draggingSong);
            }
            
            $scope.$apply();
            // console.log($scope.playlist.songs);
        });
        
    }
});

pulpApp.directive('player', function(){ 
   return {
       restrict: 'A', //attribute only
       // scope: true,
       link: function($scope, element, attr, ctrl) {
           element.bind('ended', function(e) {
               // console.log($scope.player);
               $scope.player.nextSong();
               $scope.$apply();
           });
      }
   };
});
