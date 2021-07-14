import React, { Component } from 'react';
import {
    AppRegistry,
    Text,
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    Platform
} from 'react-native';
import RNFS from 'react-native-fs';
import appHelper from '../utils/AppHelper';


export default class DownloadFile extends Component {
    constructor() {
        super()
        this.state = {
            isDone: false,
            animating: false,
            file_path: "",
            url: "",
            selectedImage: ""
        };

        this.onBeginHandler = this.onBeginHandler.bind(this);
        this.onProgressHandler = this.onProgressHandler.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.url !== state.url) {
            return {
                url: props.url,
                directory: props.directory
            }
        }
        if (props.selectedImage !== state.selectedImage) {
            return {
                selectedImage: props.selectedImage,
            }
        }
        return null
    }

    async componentDidMount() {
        this.updateImageView();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.url !== prevState.url) {
            this.updateImageView();
        }
    }

    async updateImageView() {
        try {
            const { url, directory } = this.state

            let directory_path = `${appHelper.getHomeDirectoryPath()}${directory}/`
            let file_name = appHelper.fileNameFromUrl(url)
            let destination = `${directory_path}${file_name}`

            let is_exits_file = await RNFS.exists(destination)
            if (is_exits_file == false) {

                let is_exits_directory = await RNFS.exists(directory_path)
                if (is_exits_directory == false) {
                    await RNFS.mkdir(directory_path)
                }

                this.setState({ file_path: destination, isDone: false, animating: true })
                RNFS.downloadFile({
                    fromUrl: url,
                    toFile: `${destination}`,
                    begin: this.onBeginHandler,
                    progress: this.onProgressHandler
                }).promise.then((res) => {
                    if (res.statusCode == 200) {
                        this.setState({ isDone: true, animating: false, url: url })
                        this.props.onFinish(res)
                    }
                });
            } else {
                this.setState({ file_path: destination, isDone: true, animating: false })
                this.props.onFinish(destination)
            }
        } catch (error) {
            console.log("DownloadFile - componentDidMount ", error)
        }
    }

    onBeginHandler(res) {
        this.setState({
            animating: true
        })
        this.props.onBegin(res)
    }

    onProgressHandler(res) {
        this.props.onProgress(res)
    }

    render() {

        const { animating, file_path } = this.state

        const { placeholderImage, selectedImage } = this.props
        // console.log(placeholderImage, selectedImage)
        // If placeholder of image is provided
        if (placeholderImage != undefined) {
            // If downloading completed
            if (this.state.isDone == false) {
                return (
                    <View style={[styles.container]} >
                        {
                            (selectedImage == null)
                                ? <Image style={{
                                    width: this.props.width,
                                    height: this.props.height,
                                    resizeMode: 'cover'
                                }}
                                    source={placeholderImage}
                                />
                                : <Image style={{
                                    width: this.props.width,
                                    height: this.props.height,
                                    resizeMode: 'cover'
                                }}
                                    source={selectedImage}
                                />
                        }
                    </View>
                )
            } else {
                return (
                    <View style={[styles.container]} >
                        <Image style={{
                            width: this.props.width,
                            height: this.props.height,
                            resizeMode: 'cover'
                        }}
                            source={{ uri: ((Platform.OS == 'ios') ? "" : "file:///") + file_path }}
                        />
                    </View>
                )
            }
        } else if (this.state.isDone == false) {
            return (
                <View style={[styles.container]} >
                    <ActivityIndicator
                        animating={animating}
                        color='#fff'
                        size="small"
                        style={styles.activityIndicator} />
                </ View>
            )
        } else {
            return (
                <View style={[styles.container]} >
                    <Image style={{
                        width: this.props.width,
                        height: this.props.height,
                        resizeMode: this.props.resizeMode == undefined ? 'contain' : this.props.resizeMode
                    }}
                        source={{ uri: ((Platform.OS == 'ios') ? "" : "file:///") + file_path }}
                    />
                </View>
            )
        }
    }
}
const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    }
})