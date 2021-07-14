import React from 'react';
import { StyleSheet, FlatList, View, Dimensions, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import DefaultSlide from './DefaultSlide';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import { hp } from '../utils/Utility';
import FontSize from '../utils/FontSize';
import { Icon } from 'native-base';

const { width } = Dimensions.get('screen').width - 100;
const { height } = Dimensions.get('window').height;

const isIphoneX = (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height === 812 || width === 812)
);

export default class TourSlider extends React.Component {
    static defaultProps = {
        activeDotColor: colors.primary,
        dotColor: 'white',
        skipLabel: 'Skip',
        doneLabel: 'Finish',
        nextLabel: 'Next',
    }
    state = {
        width,
        height,
        activeIndex: 0,
    };

    goToSlide = (pageNum) => {
        this.setState({ activeIndex: pageNum });
        this.flatList.scrollToOffset({ offset: pageNum * this.state.widthView });
    }

    _onNextPress = () => {
        this.goToSlide(this.state.activeIndex + 1);
        this.props.onSlideChange && this.props.onSlideChange(this.state.activeIndex + 1, this.state.activeIndex);
    }
    _onSkipPress = () => { this.props.onSkipPress(false) }

    _onDonePress = () => { this.props.onDonePress(false) }

    _renderItem = (item) => {
        const { widthView, height } = this.state;
        const bottomSpacer = (this.props.bottomButton ? (this.props.showSkipButton ? 44 : 0) + 44 : 0) + (isIphoneX ? 34 : 0) + 64;
        const topSpacer = (isIphoneX ? 44 : 0) + (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight);
        const props = { ...item.item, bottomSpacer, topSpacer };
        return (
            <View style={{ flex: 1, alignItems: 'center', width: widthView, paddingVertical: 0 }}>
                {this.props.renderItem ? this.props.renderItem(props) : (
                    <DefaultSlide {...props} />
                )}
            </View>
        );
    }

    _renderButton = (content, onPress, isSkip) => {
        if (isSkip && !this.props.bottomButton && this.state.activeIndex == this.props.slides.length - 1) {
            return null;
        }
        let style = isSkip ? styles.leftButtonContainer : styles.rightButtonContainer;
        if (this.props.bottomButton) {
            content = <View style={[styles.bottomButton, isSkip && { backgroundColor: 'transparent' }]}>{content}</View>;
            style = styles.bottomButtonContainer;
        }
        return (
            <View style={style}>
                <TouchableOpacity onPress={onPress} style={[this.props.bottomButton && styles.flexOne, { alignItems: 'center', flexDirection: 'row' }]}>
                    {
                        isSkip == true
                            ? <Icon type='FontAwesome' name='angle-left' style={{ fontSize: FontSize('large'), color: colors.primary }} />
                            : null
                    }
                    {content}
                    {
                        isSkip == false
                            ? <Icon type='FontAwesome' name='angle-right' style={{ fontSize: FontSize('large'), color: colors.primary }} />
                            : null
                    }
                </TouchableOpacity>
            </View>
        )
    }

    _renderNextButton = () => {
        let content = this.props.renderNextButton ? this.props.renderNextButton() : <Text style={styles.buttonText}>{this.props.nextLabel}</Text>;
        return this._renderButton(content, this._onNextPress, false);
    }

    _renderDoneButton = () => {
        let content = this.props.renderDoneButton ? this.props.renderDoneButton() : <Text style={styles.buttonText}>{this.props.doneLabel}</Text>;
        return this._renderButton(content, this._onDonePress, false);
    }

    _renderSkipButton = () => {
        let content = this.props.renderSkipButton ? this.props.renderSkipButton() : <Text style={styles.buttonText}>{this.props.skipLabel}</Text>;
        return this._renderButton(content, this._onSkipPress, true);
    }

    _renderPagination = () => {
        if (this.props.slides.length <= 1) return null;

        const skipBtn = this.props.showSkipButton && this._renderSkipButton();
        const btn = this.state.activeIndex == (this.props.slides.length - 1) ? this._renderDoneButton() : this._renderNextButton();
        return (
            <View style={styles.paginationContainer}>
                <View style={styles.paginationDots}>
                    {!this.props.bottomButton && skipBtn}
                    <View style={{ flexDirection: 'row' }}>
                        {this.props.slides.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    { backgroundColor: i === this.state.activeIndex ? this.props.activeDotColor : this.props.dotColor },
                                    styles.dot,
                                ]}
                            />
                        ))}
                    </View>
                    {!this.props.bottomButton && btn}
                </View>
                {/* {this.props.bottomButton && btn}
                {this.props.bottomButton && skipBtn} */}
            </View>
        )
    }

    _onMomentumScrollEnd = (e) => {
        const offset = e.nativeEvent.contentOffset.x;
        // Touching very very quickly and continuous brings about
        // a variation close to - but not quite - the width.
        // That's why we round the number.
        // Also, Android phones and their weird numbers
        const newIndex = Math.round(offset / this.state.widthView);
        if (newIndex === this.state.activeIndex) {
            // No page change, don't do anything
            return;
        }

        const lastIndex = this.state.activeIndex;
        this.setState({ activeIndex: newIndex });
        this.props.onSlideChange && this.props.onSlideChange(newIndex, lastIndex);
    }

    _onLayout = event => {
        this.setState({
            widthView: event.nativeEvent.layout.width,
            heightView: event.nativeEvent.layout.height
        });
    }

    render() {
        return (
            <View style={[styles.flexOne]} onLayout={(e) => this._onLayout(e)}>
                <FlatList
                    ref={ref => this.flatList = ref}
                    data={this.props.slides}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    style={{ flex: 1, }}
                    renderItem={this._renderItem}
                    onMomentumScrollEnd={this._onMomentumScrollEnd}
                />
                {this._renderPagination()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    flexOne: {
        flex: 1,
    },
    paginationContainer: {
        position: 'absolute',
        // bottom: 16 + (isIphoneX ? 34 : 0),
        bottom: hp(0),
        left: 0,
        right: 0,
    },
    paginationDots: {
        height: 50,
        marginHorizontal: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        borderTopWidth: 1, borderTopColor: '#96cffe',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 10,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.primary
    },
    leftButtonContainer: {
        position: 'absolute',
        left: 0,
    },
    rightButtonContainer: {
        position: 'absolute',
        right: 0,
    },
    bottomButtonContainer: {
        height: 44,
        marginHorizontal: 16,
    },
    bottomButton: {
        flex: 1,
        backgroundColor: "red",
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#000', borderWidth: 1,
    },
    buttonText: {
        backgroundColor: 'transparent',
        color: colors.primary,
        fontSize: FontSize("small"),
        paddingVertical: 15,
        paddingHorizontal: 10,
        fontFamily: Fonts.HelveticaNeue,
    }
});
