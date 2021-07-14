import React, { Component } from 'react';
import { View, Button, Text, Image } from 'react-native';
import Svg, {
    Circle,
    Ellipse,
    G,
    TSpan,
    TextPath,
    Path,
    Polygon,
    Polyline,
    Line,
    Rect,
    Use,
    Image as SVGImage,
    Symbol,
    Defs,
    LinearGradient,
    RadialGradient,
    Stop,
    ClipPath,
    Pattern,
    Mask,
    SvgUri,
} from 'react-native-svg';
import colors from '../utils/Colors';

// Reference
// https://github.com/murtraja/react-native-story/blob/master/src/App.js

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

function offsetDegree(n) {
    if (n === 1) {
        return 2;
    }
    const degree = (49 - 2 * n) / 9
    return degree
}

const cx = 53;
const cy = 53;
const radius = 50;

const N = 8;
data = Array.from(new Array(N), (val, index) => index);

const imageSize = 110;
const origin = 53 - imageSize / 2;

class StoryCircle extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Svg height={this.props.height == null ? 50 : this.props.height} width={this.props.width == null ? 50 : this.props.width} viewBox="0 0 106 106">
                <Defs>
                    <ClipPath id="clip">
                        <Circle cx="50%" cy="50%" r="40%" />
                    </ClipPath>
                </Defs>
                <G>
                    {Array.from({ length: this.props.size }, (item, index) => {
                        const size = this.props.size;
                        const stepDegree = 360 / size;
                        // const offsetDegree = size == 1 ? 0 : 5
                        let startDegree = index * stepDegree + offsetDegree(size);
                        let endDegree = (index + 1) * stepDegree - offsetDegree(size);
                        const color = index < this.props.read ? 'grey' : colors.primary;

                        if (this.props.size == 1) {
                            startDegree = 1
                            endDegree = 360.8
                        }
                        return (
                            <Path
                                key={index}
                                d={describeArc(cx, cy, radius, startDegree, endDegree)}
                                fill="none"
                                stroke={color}
                                strokeWidth={3}
                            />);
                    }
                    )}
                </G>
                <SVGImage x={origin} y={origin} preserveAspectRatio="xMidYMid slice" height={imageSize} width={imageSize} href={{ uri: this.props.uri }} clipPath="url(#clip)" />
            </Svg>
        );
    }
}

export default class Test extends Component {

    constructor(props) {
        super(props);
        this.state = {
            size: 2,
            read: 1,
        }
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ height: this.props.height == null ? 50 : this.props.height, width: this.props.width == null ? 50 : this.props.width, flexDirection: 'row' }}>
                    <View style={{ padding: 0 }}>
                        <StoryCircle size={(this.props.size == null ? 1 : this.props.size)} read={(this.props.read == null ? 1 : this.props.read)} uri={this.props.uri} height={this.props.height} width={this.props.width} />
                    </View>
                </View>
            </View>
        );
    }
}