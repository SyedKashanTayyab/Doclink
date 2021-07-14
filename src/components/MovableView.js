import React, { Component } from "react";
import { Animated, Dimensions, PanResponder, Platform, StyleSheet, View } from "react-native";
import { wp } from "../utils/Utility";
import WebView from "react-native-webview";

class MovableView extends Component {
    constructor(props) {
        super(props);
        // Initialize state
        this.state = {

            // Create instance of Animated.XY, which interpolates  X and Y values
            animate: new Animated.ValueXY(), // Inits both x and y to 0
        };

        // Set value of x and y coordinate
        this.state.animate.setValue({ x: 0, y: 0 });

        this._panResponder = PanResponder.create({

            // Asks to be the touch responder for a press on the View
            onMoveShouldSetPanResponder: () => true,

            // Actions taken when the View has begun responding to touch events
            onPanResponderGrant: () => {

                // Set offset state.animate to prevent Animated.View from returning to 0 coordinates when it is moved again.
                this.state.animate.setOffset({
                    x: this.state.animate.x._value,
                    y: this.state.animate.y._value
                });

                // Set value to 0/0 to prevent AnimatedView from "jumping" on start of animate. Stabilizes the component.
                this.state.animate.setValue({ x: 0, y: 0 })
            },

            // The user is moving their finger
            onPanResponderMove: (e, gesture) => {

                // Set value of state.animate x/y to the delta value of each
                this.state.animate.setValue({
                    x: gesture.dx,
                    y: gesture.dy
                });
            },

            // Fired at the end of the touch
            onPanResponderRelease: () => {

                // Merges the offset value into the base value and resets the offset to zero

                this.state.animate.flattenOffset();

                if (this.state.animate.y._value < 0) {
                    Animated.spring(this.state.animate.y, {
                        toValue: wp(-65),
                    }).start();
                } else if (this.state.animate.y._value > 0) {
                    Animated.spring(this.state.animate.y, {
                        toValue: wp(70),
                    }).start();
                }

                Animated.spring(this.state.animate.x, {
                    toValue: 0,
                }).start();

                this.state.animate.flattenOffset();
            }
        });
    } // End of constructor

    render() {
        return (
            <Animated.View
                {...this._panResponder.panHandlers} // Pass all panHandlers to our AnimatedView
                style={[this.state.animate.getLayout(), styles.button]} // getLayout() converts {x, y} into {left, top} for use in style
            >
                <WebView
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    automaticallyAdjustContentInsets={true}
                    mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
                    userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
                    allowsInlineMediaPlayback={true}
                    decelerationRate="normal"
                    startInLoadingState={true}
                    scrollEnabled={false}
                    scalesPageToFit={false}
                    style={{}}
                    containerStyle={{}}
                    source={{
                        html: '<iframe style="border-radius: 8px; border-width: 0" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/0-jtXo620Ts?autoplay=1&controls=0&enablejsapi=1&loop=1&rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope" allowfullscreen></iframe>'
                    }}
                />
            </Animated.View>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        width: wp(100),
        height: wp(60),
        padding: 0,
        borderWidth: 0,
    }
});

export default MovableView;