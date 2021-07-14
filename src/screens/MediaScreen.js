import React, { Component } from 'react';
import { View, ImageBackground, StyleSheet, Image, Dimensions, FlatList, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MessageModel from '../schemas/models/MessageModel';
import ImageViewer from '../components/ImageViewer'
import { SafeAreaView } from 'react-navigation'
import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

class MediaScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            images: [],
            chatroom: null,
            refresh: false
        };

        this.imageViewerElement = React.createRef();
    }

    async componentDidMount() {
        let chatroom_id = ''
        let chatroom = null
        if (this.state.chatroom == null) {
            const { navigation } = this.props;
            chatroom = await navigation.getParam('chatroom', null);
            // console.log(chatroom)
            chatroom_id = chatroom.id
        } else {
            chatroom_id = this.state.chatroom.id
        }
        this.setState({
            chatroom: chatroom
        }, () => {
            this.fetch_media()
        })
    }

    // Fetch media from db
    fetch_media() {
        console.log("ID:", this.state.chatroom.id)
        let arrMessages = MessageModel.fetch_media(this.state.chatroom.id)
        arrMessages.map((item) => {
            console.log("Message Type", item.message_type)
        })
        console.log(arrMessages.length)
        this.setState({
            images: arrMessages,
        })
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.fetch_media();
    }

    handleImageViewerPopup = (imageUrl) => {

        let params = {
            setImageViewerVisibility: true,
            setViewHeading: "",
            setViewerImage: imageUrl,
        }

        // Fire Function On Child Component
        this.imageViewerElement.current.handleImageViewer(params);
    }

    render() {
        const { refresh, images } = this.state

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Media"}
                        context={this.props}
                        // removeBackButton={false}
                        backButton={true}
                        right={null}
                        noShadow={true}
                        transparent={Platform.OS === 'ios' ? true : false}
                    />
                    {/* NAVIGATION HEADER END*/}

                    <View style={{
                        flex: 1,
                        marginTop: hp(1),
                        marginHorizontal: hp(1),
                        backgroundColor: colors.transparent,
                    }}>
                        <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">

                            <FlatList
                                refreshing={refresh}
                                onRefresh={() => this.fetch_media()}
                                style={styles.list}
                                data={images}
                                renderItem={({ item, index }) => {
                                    // console.log(item.body)
                                    return (

                                        <TouchableOpacity
                                            onPress={() => { this.handleImageViewerPopup(item.body) }}
                                        >
                                            <View style={styles.boxDefault}>
                                                <Image resizeMode="cover" style={{ flex: 1, width: "100%", height: "100%" }} source={{ uri: item.body }} />
                                            </View>
                                        </TouchableOpacity>

                                    )
                                }}
                                keyExtractor={(item, index) => item + index}
                                numColumns={3}
                                refreshing={refresh}
                            />

                            {/* Image Viewer - Popup */}
                            <ImageViewer
                                ref={this.imageViewerElement}
                            // onPressButton={this.handleImageViewerPopup}
                            />
                        </ImageBackground>

                    </View>
                </SafeAreaView>
            </Container>
        );
    }
}

const styles = StyleSheet.create({

    chatBackground: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
    },
    boxDefault: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparent,
        height: 150,
        width: (SCREEN_WIDTH / 3),
        padding: wp(0.5)
    },
    list: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        backgroundColor: colors.transparent,
        marginBottom: hp(2),
        // paddingVertical: hp(4),
    },
});
export default MediaScreen;