'use strict';

import React, {Component} from 'react';
import { Content,Form } from 'native-base';
import BlockInfo from '../BlockInfo/BlockInfo';

export default class Info extends Component {

    render(){
        return (
            <Content padder>
                <Form>
                    <BlockInfo
                        header="Get Channel ID"
                        value={this.props.channelId}
                    />
                    <BlockInfo
                        header="Device ID"
                        value={this.props.deviceId}
                    />
                </Form>
            </Content>
        );
    }
}