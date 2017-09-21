'use strict';

import React, {Component} from 'react';



import { Content,Form } from 'native-base';

import BlockInfo from '../BlockInfo/BlockInfo';

export default class Info extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channelId: props.channelId,
            deviceId: props.deviceId
        };
    }

    render(){
        return (
            <Content padder>
                <Form>
                    <BlockInfo
                        header="Get Channel ID"
                        value={this.state.channelId}
                    />
                    <BlockInfo
                        header="Device ID"
                        value={this.state.deviceId}
                    />
                </Form>
            </Content>
        );
    }
}