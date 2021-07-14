import Sound from 'react-native-sound';
var moment = require('moment');

let Sounds = {
    newRequest: function () {

        let time = moment().utc(true)
        let appOpenTime = moment(global.appOpenTime)
        let diff = time.diff(appOpenTime, 'second')
        // console.log("Moment Time diff", diff)
        if (diff < 6) {
            return;
        }

        Sound.setCategory('Playback', true); // true = mixWithOthers

        let hello = new Sound(require('../assets/sounds/general.mp3'), (error) => {
            if (error) {
                console.log(error)
            }
            hello.play((success) => {
                if (success) {
                    hello.release();
                } else {
                    console.log('sound failed to play')
                }
            });
        })
    },

    earnSound: function () {

        Sound.setCategory('Playback', true); // true = mixWithOthers

        let hello = new Sound(require('../assets/sounds/earningsound_updated.mpeg'), (error) => {
            if (error) {
                console.log("======================")
                console.log("Error In Playing Sound File", error)
                console.log("======================")
            }
            hello.play((success) => {
                if (success) {
                    // console.log("======================")
                    // console.log("Success!!!", success)
                    // console.log("======================")
                    hello.release();
                } else {
                    console.log('sound failed to play')
                }
            });
        })
    }
};

module.exports = Sounds
