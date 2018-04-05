import React, {Component} from 'react';
import {FilterArea} from './FilterArea.jsx';
import {Result} from './Result.jsx';

export class Root extends Component {

    render() {
        return (
            <div>
                <FilterArea/>
                <Result/>
            </div>
        );
    }

}