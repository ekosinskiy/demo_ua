'use strict';

import {
    UrbanAirship,
    UACustomEvent,
} from 'urbanairship-react-native';

import React, {Component} from 'react';
import {AppRegistry} from 'react-native';
import {
    Container,
    Content,
    Tabs, Tab
} from 'native-base';


import Info from './app/Components/Info/Info';
import Dashboard from './app/Components/Dashboard/Dashboard';
import DeviceInfo from 'react-native-device-info';

export default class app extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channelId: '',
            imageUrl: '',
            deepLink:'',
            modalVisible: true
        };
        UrbanAirship.setUserNotificationsEnabled(true);
    }

    componentWillMount() {
        UrbanAirship.getChannelId().then((channelId) => {
            console.log('Get channel ID:',channelId);
            this.setState({channelId: channelId});
        });

        UrbanAirship.addListener("notificationResponse", (response) => {
            console.log(response.notification);
            if('com.urbanairship.style' in response.notification.extras) {
                let img = JSON.parse(response.notification.extras['com.urbanairship.style']);
                this.setState({imageUrl: img.big_picture});
                console.log('Notification response: ', img.big_picture);
            }
            console.log('Notification response isForeground: ', response.isForeground);
            // will only be set for notification action buttons
            console.log('Notification response actionId: ', response.actionId);
        });

    }

    render() {
        let deviceId = DeviceInfo.getUniqueID();
        return (
            <Container>
                <Content>
                    <Tabs initialPage={0}>
                        <Tab heading="Main">
                            <Dashboard
                                deviceId={deviceId}
                                channelId={this.state.channelId}
                            />
                        </Tab>
                        <Tab heading="Info">
                            <Info
                                deviceId={deviceId}
                                channelId={this.state.channelId}
                            />
                        </Tab>
                    </Tabs>
                </Content>
            </Container>
        );
    }
}






