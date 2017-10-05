'use strict';

import React, {Component} from 'react';

import {
    UrbanAirship
} from 'urbanairship-react-native';

import {
    Button, Content, Label, View,
    Text, Form, Item, Input
} from 'native-base';

import {StyleSheet, TouchableHighlight} from 'react-native';
import BlockResult from '../BlockResult/BlockResult';
import DeviceInfo from 'react-native-device-info';


const styles = StyleSheet.create({
    inApp: {

    },
    modal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

    },
    modalContent:{
        margin: 'auto',
        width: '100%',
        height: 100
    },
    block: {
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    }
});

export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            inApp: '',
            accountName: '',
            email: '',
            deepLink: ''
        };
        this.activateEmail = this.activateEmail.bind(this);
        this.resetState = this.resetState.bind(this);
        this.renderInAppContent = this.renderInAppContent.bind(this);
    }

    renderInAppContent(inAppObject) {
        let displayLabels = ['alert', 'type', 'position'];
        let inApp = JSON.parse(inAppObject);
        console.log(JSON.parse(inAppObject));
        return (
            <View>
            {[...displayLabels].map((item) => {
                console.log(inApp.display[item]);
                return (<Text>{item}:{inApp.display[item]}</Text>);
            })}
            </View>
        )
    }

    componentWillMount() {
        UrbanAirship.addListener("deepLink", (event) => {
            console.log('Deep link:', event.deepLink);
            this.setState({deepLink: event.deepLink});
        });

        UrbanAirship.addListener("pushReceived", (notification) => {
            this.setState({inApp: ''});
            if (notification.extras['com.urbanairship.in_app']) {
                this.setState({inApp: this.renderInAppContent(notification.extras['com.urbanairship.in_app'])});
            }
        });
    }

    activateEmail() {
        let deviceId = this.props.deviceId;
        let requestBody = {
            channels: {
                urbanairship: {
                    address: {},
                    subscribeStatus:"subscribed"
                }
            }
        };
        requestBody['channels']['urbanairship']['address'][deviceId] = {
            os: DeviceInfo.getSystemName(),
            v: DeviceInfo.getSystemVersion(),
            token: this.props.channelId
        };
        fetch('http://ekosinskiy.api.dev.cordial.io/v1/contacts/' + this.state.email, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cordial-Accountkey': this.state.accountName
            },
            body: JSON.stringify(requestBody)
        }).then((response) => {
            console.log(response);
        });
    }

    resetState() {
        this.setState({
            deepLink:'',
            inApp:''
        });
    }

    render() {

        let inApp, deepLink;
        if(this.state.inApp!='') {
            inApp = <BlockResult header="In-App info" value={this.state.inApp}/>
        }

        if(this.state.deepLink!='') {
            deepLink=<BlockResult header="Deep link info" value={this.state.deepLink}/>
        }

        return (
            <Content padder>
                <Form>
                    <Content style={styles.modal}>
                        <Text style={styles.modalContent}></Text>
                        <Notification style={styles.modalContent} ref={(ref) => { this.notification = ref; }} />
                    </Content>

                    <Item stackedLabel>
                        <Label>Account name</Label>
                        <Input
                            onChangeText={(accountName) => this.setState({accountName})}
                        />
                    </Item>
                    <Item stackedLabel>
                        <Label>Email</Label>
                        <Input
                            onChangeText={(email) => this.setState({email})}
                            keyboardType="email-address"
                        />
                    </Item>
                    <Button full onPress={this.activateEmail}>
                        <Text>Activate</Text>
                    </Button>
                    {inApp}
                    {deepLink}
                    <Button full danger style={{marginTop:10}} onPress={this.resetState}>
                        <Text>Reset result</Text>
                    </Button>
                </Form>
            </Content>
        );
    }
}
