import React, { Component } from 'react';
import { GiftedChat } from 'react-native-gifted-chat'
import { StyleSheet, ImageBackground, Text, TextInput, Alert, TouchableOpacity, Button, View, Platform, AsyncStorage } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import NetInfo from "@react-native-community/netinfo";

// create Screen2 (Chat) class
//import firebase
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
    constructor() {
        super();

        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyAPgVJN6OS6i5iOWQP6mUH7xrAo67ks90w",
                authDomain: "messages-34033.firebaseapp.com",
                databaseURL: "https://messages-34033.firebaseio.com",
                projectId: "messages-34033",
                storageBucket: "messages-34033.appspot.com",
                messagingSenderId: "527968636505",
                appId: "1:527968636505:web:ba56d34591b5da8052eb48",
            });
        }

        this.referenceChatMessages = firebase.firestore().collection('messages');

        this.state = {
            messages: [],
            uid: 0,
            isConnected: false
        };
    }


    // get messages from asyncStorage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    // save messages in asyncStorage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    };

    // delete messages from asyncStorage
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
        } catch (error) {
            console.log(error.message);
        }
    }

    componentDidMount() {

        NetInfo.fetch().then(isConnected => {
            if (isConnected) {
                this.setState({
                    isConnected: true,
                });

                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
                    if (!user) {
                        await firebase.auth().signInAnonymously();
                    }

                    this.setState({
                        uid: user.uid,
                        messages: []
                    });
                    this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
                });
            }

            componentWillUnmount() {
                this.unsubscribe();
            };

            onCollectionUpdate = (querySnapshot) => {
                const messages = [];
                // go through each document
                querySnapshot.forEach((doc) => {
                    // get the QueryDocumentSnapshot's data
                    var data = doc.data();
                    messages.push({
                        _id: data._id,
                        text: data.text,
                        createdAt: data.createdAt.toDate(),
                        user: data.user
                    });
                });
                this.setState({
                    messages,
                });
            };

            addMessage() {
                const message = this.state.messages[0];
                this.referenceChatMessages.add({
                    _id: message._id,
                    text: message.text,
                    createdAt: message.createdAt,
                    user: message.user
                });
            }
              //define title in navigation bar
              static navigationOptions = ({ navigation }) => {
            return {
                title: navigation.state.params.userName,
            };
        };
        //appending new message to messages object
        onSend(messages = []) {
            this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, messages),
            }), () => {
                this.addMessage();
            });
        }

        // hide inputbar when offline
        renderInputToolbar(props) {
            if (this.state.isConnected == false) {
            } else {
                return (
                    <InputToolbar
                        {...props}
                    />
                );
            }
        };

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
                <View style={[styles.container, { backgroundColor: this.props.navigation.state.params.color }]}>
                    <GiftedChat
                        renderBubble={this.renderBubble.bind(this)}
                        messages={this.state.messages}
                        onSend={messages => this.onSend(messages)}
                        user={{
                            _id: this.state.uid
                        }}
                    />
                    {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
                </View>
            )
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
