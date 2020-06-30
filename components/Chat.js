import React, { Component } from 'react';
import { GiftedChat } from 'react-native-gifted-chat'
import { StyleSheet, ImageBackground, Text, TextInput, Alert, TouchableOpacity, Button, View, Platform } from 'react-native';

class Example extends React.Component {
    state = {
        messages: []
    };

    componentDidMount() {
        this.setState({
            messages: [
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                },
                {
                    _id: 2,
                    text: 'This is a system message',
                    createdAt: new Date(),
                    system: true,
                },
            ]
        })
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#000'
                    }
                }}
            />
        )
    }

    render() {
        return (
            <View>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                />
                {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
            </View>
        )
    }
}

export default class Chat extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.name,
        }
    }
    render() {
        return (
            <View style={[styles.container, { backgroundColor: this.props.navigation.state.params.color }]}>
                <Text style={{ color: '#FFFFFF' }}>This is your chat screen</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
