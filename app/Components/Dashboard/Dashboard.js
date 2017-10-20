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
            activateResponse: '',
            accountName: '',
            email: '',
            instanceName: '',
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

        UrbanAirship.addListener("notificationResponse", (response) => {
            console.log("DASHBOARD::::",response.notification);
            if('fallback' in response.notification.extras) {
                this.setState({fallback: response.notification.extras['fallback']});
            }
        });

        UrbanAirship.addListener("deepLink", (event) => {
            // let actions = JSON.parse(event.extras['com.urbanairship.actions']);
            // if(actions['^d_a']) {
            //     console.log("Fallback URL:", actions['^d_a']);
            // }

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
        //console.log(this.state);
        console.log(requestBody);
        console.log('http://'+this.state.instanceName+'.api.dev.cordial.io/v1/contacts/' + this.state.email);




        fetch('https://'+this.state.instanceName+'.api.dev.cordial.io/v1/contacts/' + this.state.email, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cordial-Accountkey': this.state.accountName,
                'Cordial-AccountKey': this.state.accountName,

            },
            body: JSON.stringify(requestBody)
        }).then((response) => {
            this.setState({activateResponse:this.wrapDeepLink('Status:'+response.status)});
            console.log(response.status);
            console.log(response);
        }).catch((err) => {
            console.log("ERROR",err);
        });
    }

    resetState() {
        this.setState({
            deepLink:'',
            inApp:'',
            activateResponse: ''
        });
    }

    render() {

        let inApp, deepLink, activateResponse;
        if(this.state.inApp!='') {
            inApp = <BlockResult header="In-App info" value={this.state.inApp}/>
        }
        if(this.state.activateResponse!='') {
            activateResponse = <BlockResult header="Activate response" value={this.state.activateResponse}/>
        }

        if(this.state.deepLink!='') {
            deepLink=<BlockResult header="Deep link info" value={this.state.deepLink}/>
        }
        console.log("STATE::::",this.state);

        return (
            <Content padder>
                <Form>
                    <Item stackedLabel>
                        <Label>Instance name</Label>
                        <Input
                            onChangeText={(instanceName) => this.setState({instanceName})}
                        />
                    </Item>
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
                    {activateResponse}
                    <Button full danger style={{marginTop:10}} onPress={this.resetState}>
                        <Text>Reset result</Text>
                    </Button>
                </Form>
            </Content>
        );
    }
}
