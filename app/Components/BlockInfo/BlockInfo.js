'use strict';

import React, {Component} from 'react';

import {H3, Content, Item, Input} from 'native-base';

export default class BlockInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header: props.header,
            value: props.value
        }
    }

    render() {
        return (
            <Content>
                <H3>{this.state.header}</H3>
                <Item>
                    <Input
                        value={this.state.value}
                    />
                </Item>
            </Content>
        );
    }
}
