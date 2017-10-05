'use strict';

import React, {Component} from 'react';
import {Label, Item, Text} from 'native-base';

export default class BlockResult extends Component {

    render() {
        return (
            <Item stackedLabel>
                <Label>{this.props.header}</Label>
                {this.props.value}
            </Item>
        );
    }
}

