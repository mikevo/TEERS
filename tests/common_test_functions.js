'use strict';

var getExampleUser = function() {
  return {
    'displayName': 'test user',
    'username': 'test1',
    'profileComplete': true,
    'profile': [{
      'spotifyId': 'spotify:track:0J5YYohq5WoOAsO891rosH',
      'ratingValue': 10,
      'addedAt': 'track_selector'
    }, {
      'spotifyId': 'spotify:track:4NV2fmS7C00DTAja9hcamX',
      'ratingValue': 10,
      'addedAt': 'track_selector'
    }, {
      'spotifyId': 'spotify:track:3ZffCQKLFLUvYM59XKLbVm',
      'ratingValue': 10,
      'addedAt': 'track_selector'
    }, {
      'spotifyId': 'spotify:track:6ORqU0bHbVCRjXm9AjyHyZ',
      'ratingValue': 10,
      'addedAt': 'track_selector'
    }, {
      'spotifyId': 'spotify:track:0XzkemXSiXJa7VgDFPfU4S',
      'ratingValue': 2,
      'addedAt': 'recommendation'
    }, {
      'spotifyId': 'spotify:track:2LlvrdnLa3XbB1b4jYuCnl',
      'ratingValue': 0,
      'addedAt': 'recommendation'
    }],
    'questionnaire': {
      'age': '11-20',
      'gender': 'male',
      'listeningHours': '< 1'
    },
    'roles': ['user'],
    'email': 't1@example.com',
    'lastName': 'user',
    'firstName': 'test'
  };
};

var getSampleTrack = function() {
  return {
    'album': {
      'album_type': 'album',
      'available_markets': ['AT'],
      'external_urls': {
        'spotify': 'https://open.spotify.com/album/5bU1XKYxHhEwukllT20xtk'
      },
      'href': 'https://api.spotify.com/v1/albums/5bU1XKYxHhEwukllT20xtk',
      'id': '5bU1XKYxHhEwukllT20xtk',
      'images': [{
        'height': 640,
        'url': 'https://i.scdn.co/image/4d9ec146e3a257b10634d9a413ef6cc3de325008',
        'width': 640
      }, {
        'height': 300,
        'url': 'https://i.scdn.co/image/956296446175bba4ccdfd6edce8c78e31d8a9add',
        'width': 300
      }, {
        'height': 64,
        'url': 'https://i.scdn.co/image/6d8f0b88783515c116fdbbe92c6d54e7f15c37c2',
        'width': 64
      }],
      'name': 'AM',
      'type': 'album',
      'uri': 'spotify:album:5bU1XKYxHhEwukllT20xtk'
    },
    'artists': [{
      'external_urls': {
        'spotify': 'https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH'
      },
      'href': 'https://api.spotify.com/v1/artists/7Ln80lUS6He07XvHI8qqHH',
      'id': '7Ln80lUS6He07XvHI8qqHH',
      'name': 'Arctic Monkeys',
      'type': 'artist',
      'uri': 'spotify:artist:7Ln80lUS6He07XvHI8qqHH'
    }],
    'available_markets': ['AT'],
    'disc_number': 1,
    'duration_ms': 201726,
    'explicit': false,
    'external_ids': {
      'isrc': 'GBCEL1300363'
    },
    'external_urls': {
      'spotify': 'https://open.spotify.com/track/2LlvrdnLa3XbB1b4jYuCnl'
    },
    'href': 'https://api.spotify.com/v1/tracks/2LlvrdnLa3XbB1b4jYuCnl',
    'id': '2LlvrdnLa3XbB1b4jYuCnl',
    'name': 'R U Mine?',
    'popularity': 79,
    'preview_url': 'https://p.scdn.co/mp3-preview/b9048c3760e294ac45b6f31dc3b96314f72333e3',
    'track_number': 2,
    'type': 'track',
    'uri': 'spotify:track:2LlvrdnLa3XbB1b4jYuCnl',
    'rating': 0,
    'inUserProfile': true
  };
};

var getConfig = function() {
  return {
    'profile': {
      'minSize': 3,
      'wantedSize': 10,
      'starRating': true,
      'starMaxRating': 5
    },
    'views': {
      'tracks': {
        'display': 6
      }
    }
  };
};
