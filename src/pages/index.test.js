import React from 'react';
import { act, create } from 'react-test-renderer';

import App from './index';
import WordSelector from '../components/WordSelector';
import { getSeed } from '../utils';

global.crypto = {
    getRandomValues: array =>
        array.map(() => Math.floor(Math.random() * Math.pow(2, 32))),
};

describe('App', () => {
    test('reset drops a passphrase before it can leak into the next phrase', () => {
        let tree;
        act(() => {
            tree = create(<App />);
        });
        const app = tree.getInstance();

        act(() => {
            app.handleGenerate();
        });
        const generated = app.state.words.slice();
        act(() => {
            app.handlePassphrase({ target: { value: 'secret' } });
        });
        expect(app.state.passphrase).toBe('secret');
        expect(app.state.seed).toBe(getSeed(generated, 'secret'));
        expect(app.state.checksumValid).toBe(true);

        act(() => {
            app.handleReset();
        });
        expect(app.state.passphrase).toBe('');
        expect(app.state.seed).toBe('');
        expect(app.state.isCompleted).toBe(false);

        const selectors = tree.root.findAllByType(WordSelector);
        expect(selectors).toHaveLength(24);
        expect(selectors[0].props.disabled).toBe(false);
        expect(selectors[23].props.disabled).toBe(true);
    });

    test('an invalid last word does not produce a seed', () => {
        let tree;
        act(() => {
            tree = create(<App />);
        });
        const app = tree.getInstance();
        act(() => {
            app.handleCountChange(12);
        });
        const words = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'.split(
            ' '
        );
        words.slice(0, 11).forEach((word, index) => {
            act(() => {
                app.handleChange({ word, index });
            });
        });
        act(() => {
            app.handleChange({ word: 'abandon', index: 11 });
        });
        expect(app.state.isCompleted).toBe(true);
        expect(app.state.checksumValid).toBe(false);
        expect(app.state.seed).toBe('');
        const rendered = JSON.stringify(tree.toJSON());
        expect(rendered).toContain('Checksum does not match this phrase');
        expect(rendered).not.toContain('PBKDF2');
    });
});
