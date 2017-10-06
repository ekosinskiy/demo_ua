'use strict';

import React, {Component} from 'react';

import {
    UrbanAirship
} from 'urbanairship-react-native';

import {
    Button, Content, Label, View,
    Text, Form, Item, Input
} from 'native-base';

import BlockResult from '../BlockResult/BlockResult';
import DeviceInfo from 'react-native-device-info';


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
        this.wrapDeepLink = this.wrapDeepLink.bind(this);
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

    wrapDeepLink(deepLink) {
        return (
            <Text>{deepLink}</Text>
        );
    }

    componentWillMount() {
        UrbanAirship.addListener("deepLink", (event) => {
            console.log('Deep link:', event.deepLink);
            this.setState({deepLink: this.wrapDeepLink(event.deepLink)});
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
