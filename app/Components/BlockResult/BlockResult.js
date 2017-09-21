'use strict';

import React, {Component} from 'react';

import {Label, Item, Text} from 'native-base';

export default class BlockResult extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header: props.header,
            value: props.value
        }
    }

    render() {
        return (
            <Item stackedLabel>
                <Label>{this.state.header}</Label>
                <Text>
                    {this.state.value}
                </Text>
            </Item>
        );
    }
}

