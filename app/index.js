import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './Root';
import './app.global.css';

render(
    <AppContainer>
        <Root/>
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./Root', () => {
        // eslint-disable-next-line global-require
        const NextRoot = require('./Root').default;
        render(
            <AppContainer>
                <NextRoot/>
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
