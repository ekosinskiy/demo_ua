'use strict';

import React, {Component} from 'react';

import {
    UrbanAirship
} from 'urbanairship-react-native';

import {
    Button, Content, Label, View,
    Text, Form, Item, Input, Picker
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
            accountList:[],
            email: '',
            instanceName: '',
            deepLink: '',
            fallback:'',
            serverName: '',
            serverList:[],
            accList:[]


        };
        this.activateEmail = this.activateEmail.bind(this);
        this.resetState = this.resetState.bind(this);
        this.renderInAppContent = this.renderInAppContent.bind(this);
        this.wrapDeepLink = this.wrapDeepLink.bind(this);
        this.makeAuth = this.makeAuth.bind(this);
        this.getServerList = this.getServerList.bind(this);
        this.getAccountList = this.getAccountList.bind(this);

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
            <Text key={Math.floor(Math.random() * 10000)}>{deepLink}</Text>
        );
    }

    getServerList() {
        fetch('http://cordialdev-trackjs-v2.s3.amazonaws.com/dev-test/uaappconfig.json', {
            method: 'GET'
        }).then((response) => {
            let serverList = JSON.parse(response._bodyText);
            console.log(serverList);
            let serverObjects = [];
            for(let i=0;i<serverList.length;i++) {
                let x = serverList[i];
                serverObjects.push(<Item label={x.name} value={x.server} key={x.name} />);
                if(x.isDefault && x.isDefault===1) {
                    this.setState({serverName:x.server});
                }
            }
            this.setState({serverList: serverObjects});
            this.getAccountList(this.state.serverName);
        }).catch((err) => {
            console.log("ERROR",err);
            this.setState({activateResponse:this.wrapDeepLink('Error:'+err.message)});
        });
    }

    getAccountList(servername) {
        console.log("SERVER NAME:",servername);
        console.log("GET ACCOUNT URL:",this.state.serverName+"accounts/list");
        fetch(this.state.serverName+"accounts/list", {
            method: 'GET'
        }).then((response) => {
            let accountList = JSON.parse(response._bodyText);
            this.setState({accList: accountList});
            this.setState({accountName:accountList[0].name});
            this.setState({channelName:accountList[0].channel});
            this.setState({accountList:accountList.map(x => <Item value={x.name} label={x.name} key={x.name}/>)});
        }).catch((err) => {
            console.log("ERROR",err);
            this.setState({activateResponse:this.wrapDeepLink('Error:'+err.message)});
        });
    }

    componentWillMount() {
        this.getServerList();

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
        fetch('http://'+this.state.serverName+"/"+this.state.accountName+"/proxy", {
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
            this.setState({activateResponse:[this.wrapDeepLink('Status:'+response.status),this.wrapDeepLink('Token:'+resp.token)]});
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


        console.log(requestBody);

        fetch('http://'+this.state.serverName+"/"+this.state.accountName+"/proxy/"+this.state.email+"/"+this.state.authToken, {
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

    onServerChange(value) {
        this.setState({
            serverName: value
        });
        this.getAccountList(value);
    }

    onAccountChange(value) {
        let accountList = this.state.accList;
        console.log(accountList);
        for(let i=0;i<accountList.length;i++) {
            if(value === accountList[i].name) {
                console.log("SELECT CHANNEL FOR:",value," :: ",accountList[i].channel);
                this.setState({channelName:accountList[i].channel});
            }
        }
        this.setState({
            accountName: value
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
        let serverList = this.state.serverList;
        let accountList = this.state.accountList;
        return (
            <Content padder>
                <Form>
                    <Picker
                        iosHeader="Select proxy server"
                        mode="dropdown"
                        selectedValue={this.state.serverName}
                        onValueChange={this.onServerChange.bind(this)}
                    >
                        {serverList}
                    </Picker>
                    <Picker
                        iosHeader="Select account"
                        mode="dropdown"
                        selectedValue={this.state.accountName}
                        onValueChange={this.onAccountChange.bind(this)}
                    >
                        {accountList}
                    </Picker>


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
