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

const SERVER_NAME = "10.10.201.132:8088";

export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            inApp: '',
            activateResponse: '',
            accountName: '',
            email: '',
            instanceName: '',
            deepLink: '',
            fallback:''
        };
        this.activateEmail = this.activateEmail.bind(this);
        this.resetState = this.resetState.bind(this);
        this.renderInAppContent = this.renderInAppContent.bind(this);
        this.wrapDeepLink = this.wrapDeepLink.bind(this);
        this.makeAuth = this.makeAuth.bind(this);

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
            this.setState({fallback: ''});
            if('extras' in response.notification) {
                if('com.urbanairship.actions' in response.notification.extras) {
                    let deepLinkData = JSON.parse(response.notification.extras['com.urbanairship.actions']);
                    if('^d_a' in deepLinkData) {
                        console.log("RESP2::::",deepLinkData['^d_a']);
                        this.setState({fallback:this.wrapDeepLink(deepLinkData['^d_a'])});
                    }

                }
            }
        });

        UrbanAirship.addListener("deepLink", (event) => {
            this.setState({deepLink: this.wrapDeepLink(event.deepLink)});
        });

        UrbanAirship.addListener("pushReceived", (notification) => {
            console.log("NOTIFICATIONS:::",notification);
            this.setState({inApp: ''});
            if('extras' in notification) {
                if ('com.urbanairship.in_app' in notification.extras) {
                    this.setState({inApp: this.renderInAppContent(notification.extras['com.urbanairship.in_app'])});
                }
            }
        });
    }

    makeAuth() {
        let requestBody = {
            email: this.state.email
        };
        console.log("makeAuth");
        fetch('http://'+SERVER_NAME+"/proxy", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'

            },
            body: JSON.stringify(requestBody)
        }).then((response) => {

            let resp = JSON.parse(response._bodyText);
            console.log(resp);
            console.log("TOKEN:",resp.token);
            if(resp.token) {
                this.setState({authToken:resp.token});
            }
        }).catch((err) => {
            console.log("ERROR",err);
            this.setState({activateResponse:this.wrapDeepLink('Error:'+err.message)});
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
        requestBody = {};
        requestBody[deviceId] = {
            os: DeviceInfo.getSystemName(),
            v: DeviceInfo.getSystemVersion(),
            token: this.props.channelId
        };
        // let server = this.state.instanceName+'.api.dev.cordial.io/v1/contacts/';
        // if(this.state.instanceName.toLowerCase() === 'admin') {
        //     server = 'api.cordial.io/v1/contacts/';
        // }
        // if(this.state.instanceName.toLowerCase() === 'api') {
        //     server = 'api-staging.cordial.io/v1/contacts/';
        // }
        //this.setState({activateResponse:[this.wrapDeepLink('Server:'+server),this.wrapDeepLink('Server:'+server)]});
        //console.log(this.state);
       // console.log(requestBody);

        console.log(requestBody);

        fetch('http://'+SERVER_NAME+"/proxy/"+this.state.email+"/"+this.state.authToken, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }).then((response) => {
            this.setState({activateResponse:this.wrapDeepLink('Status:'+response.status)});
            //console.log(response.status);
            console.log(response);
        }).catch((err) => {
            console.log("ERROR",err);
            this.setState({activateResponse:this.wrapDeepLink('Error:'+err.message)});
        });
    }

    resetState() {
        this.setState({
            deepLink:'',
            inApp:'',
            activateResponse: '',
            fallback:''
        });
    }

    render() {

        let inApp, deepLink, activateResponse, fallback;
        if(this.state.inApp!='') {
            inApp = <BlockResult header="In-App info" value={this.state.inApp}/>
        }
        if(this.state.activateResponse!='') {
            activateResponse = <BlockResult header="Activate response" value={this.state.activateResponse}/>
        }

        if(this.state.deepLink!='') {
            deepLink=<BlockResult header="Deep link info" value={this.state.deepLink}/>
        }
        if(this.state.fallback!='') {
            fallback=<BlockResult header="Fallback URL" value={this.state.fallback}/>
        }
        //console.log("STATE::::",this.state);
        /*
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
         */
        return (
            <Content padder>
                <Form>

                    <Item stackedLabel>
                        <Label>Email</Label>
                        <Input
                            onChangeText={(email) => this.setState({email})}
                            keyboardType="email-address"
                        />
                    </Item>
                    <Button full onPress={this.makeAuth}>
                        <Text>Auth by proxy</Text>
                    </Button>
                    <Button full style={{marginTop:10}} onPress={this.activateEmail}>
                        <Text>Activate</Text>
                    </Button>
                    {inApp}
                    {deepLink}
                    {fallback}
                    {activateResponse}
                    <Button full danger style={{marginTop:10}} onPress={this.resetState}>
                        <Text>Reset result</Text>
                    </Button>
                </Form>
            </Content>
        );
    }
}
