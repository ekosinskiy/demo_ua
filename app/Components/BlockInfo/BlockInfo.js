'use strict';

import React, {Component} from 'react';

import {H3, Content, Item, Input} from 'native-base';

export default class BlockInfo extends Component {

    render() {
        return (
            <Content>
                <H3>{this.props.header}</H3>
                <Item>
                    <Input
                        value={this.props.value}
                    />
                </Item>
            </Content>
        );
    }
}
