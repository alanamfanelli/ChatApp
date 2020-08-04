import React, { Component } from 'react';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat'
import { StyleSheet, ImageBackground, Text, TextInput, Alert, TouchableOpacity, Button, View, Platform, AsyncStorage } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import NetInfo from "@react-native-community/netinfo";
import MapView from 'react-native-maps';
//import custom CustomActions
import CustomActions from './CustomActions';

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
        NetInfo.isConnected.addEventListener(
            'connectionChange',
            this.handleConnectivityChange
        );

        NetInfo.fetch().then(isConnected => {
            if (isConnected) {
                this.setState({
                    isConnected: true,
                });

                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
                    if (!user) {
                        await firebase.auth().signInAnonymously();
                    } else {

                        this.setState({
                            uid: user.uid,
                            messages: []
                        });
                    }
                    this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
                });
            } else {
                this.setState({
                    isConnected: false,
                });

                this.getMessages();
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.authUnsubscribe();

        NetInfo.isConnected.removeEventListener(
            'connectionChange',
            this.handleConnectivityChange
        );
    };

    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            var data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text || '',
                createdAt: data.createdAt.toDate(),
                user: data.user,
                location: data.location || null,
            });
        });
        this.setState({
            messages,
        });
    };

    handleConnectivityChange = (isConnected) => {
        if (isConnected == true) {
            this.setState({
                isConnected: true
            });
            this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
        } else {
            this.setState({
                isConnected: false
            });
        }
    };


    addMessage() {
        const message = this.state.messages[0];
        this.referenceChatMessages.add({
            _id: message._id,
            text: message.text || '',
            createdAt: message.createdAt,
            user: message.user,
            location: message.location || null,
        });
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.name,
        };
    };

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            this.saveMessages();
        });
    };

    // hide inputbar when offline
    renderInputToolbar(props) {
        console.log('renderInputToolbar --> props', props.isConnected);
        if (props.isConnected === false) {
        } else {
            return (
                <InputToolbar
                    {...props}
                />
            );
        }
    };

    //display the communication features
    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };

    //custom map view
    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{
                        width: 150,
                        height: 100,
                        borderRadius: 13,
                        margin: 3
                    }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
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
            <View style={[styles.container, { backgroundColor: this.props.navigation.state.params.color }]}>
                <GiftedChat
                    messages={this.state.messages}
                    isConnected={this.state.isConnected}
                    renderInputToolbar={this.renderInputToolbar}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
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
        width: '100%'
    },
});