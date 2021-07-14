import React, { Component } from 'react';
import { WebView, Platform, View } from 'react-native';

export default class StripeCheckout extends Component {
    render() {

        const jsCode = `(function() {
                    var originalPostMessage = window.postMessage;

                    var patchedPostMessage = function(message, targetOrigin, transfer) {
                      originalPostMessage(message, targetOrigin, transfer);
                    };

                    patchedPostMessage.toString = function() {
                      return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
                    };

                    window.postMessage = patchedPostMessage;
                  })();`;
        return (
            <WebView
                javaScriptEnabled={true}
                scrollEnabled={false}
                bounces={false}
                injectedJavaScript={jsCode}
                source={{
                    html: `<script src="https://checkout.stripe.com/checkout.js"></script>
            <script>
            var handler = StripeCheckout.configure({
              key: 'sk_test_oYPKmNstUifUQynm2tNMvSfR',
              image: 'http://dev.appsocio.com/doclinkadmin/public/images/logo.png',
              locale: 'auto',
              token: function(token) {
                window.postMessage(token.id, token.id);
              },
            });

            window.onload = function() {
              handler.open({
                image: 'http://dev.appsocio.com/doclinkadmin/public/images/logo.png',
                name: 'Doclink',
                description: 'Package 1',
                amount: 20,
                currency: 'USD',
                allowRememberMe: false,
                email: 'test@test.com',
                closed: function() {
                  window.postMessage("WINDOW_CLOSED", "*");
                }
              });
            };
            </script>`, baseUrl: ''
                }}
            onMessage={event => event.nativeEvent.data === 'WINDOW_CLOSED' ? this._onClose : this._onPaymentSuccess(event.nativeEvent.data)}
                style={{ flex: 1 }}
                scalesPageToFit={Platform.OS === 'android'}
            />
        );
    }
}

StripeCheckout.propTypes = {
    publicKey: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired,
    storeName: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    allowRememberMe: PropTypes.bool.isRequired,
    onPaymentSuccess: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    currency: PropTypes.string,
    prepopulatedEmail: PropTypes.string,
    style: View.propTypes.style
};

StripeCheckout.defaultProps = {
    prepopulatedEmail: '',
    currency: 'USD',
};