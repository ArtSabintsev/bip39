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
        expect(app.state.addresses.btc).toMatch(/^bc1q/);
        expect(app.state.addresses.evm).toMatch(/^0x[0-9a-fA-F]{40}$/);

        act(() => {
            app.handleReset();
        });
        expect(app.state.passphrase).toBe('');
        expect(app.state.seed).toBe('');
        expect(app.state.addresses).toBe(null);
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
        expect(app.state.addresses).toBe(null);
        const rendered = JSON.stringify(tree.toJSON());
        expect(rendered).toContain('Checksum does not match this phrase');
        expect(rendered).not.toContain('PBKDF2');
        expect(rendered).not.toContain('bc1q');
    });

    const ABANDON =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const EMPTY_SEED =
        '5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4';

    function phraseBox(tree) {
        return tree.root
            .findAllByType('textarea')
            .find(node => node.props.name === 'bip39-phrase');
    }

    function paste(tree, value) {
        act(() => {
            phraseBox(tree).props.onChange({ target: { value } });
        });
    }

    test('a pasted phrase fills the words and shows its seed', () => {
        let tree;
        act(() => {
            tree = create(<App />);
        });
        const app = tree.getInstance();
        act(() => {
            app.handlePassphrase({ target: { value: 'secret' } });
        });
        const pasted = ABANDON.split(' ')
            .map((word, index) => index + 1 + '. ' + word.toUpperCase())
            .join('\n');
        paste(tree, pasted);
        expect(app.state.wordCount).toBe(12);
        expect(app.state.words).toEqual(ABANDON.split(' '));
        expect(app.state.checksumValid).toBe(true);
        expect(app.state.phraseError).toBe('');
        expect(app.state.passphrase).toBe('secret');
        expect(app.state.seed).toBe(getSeed(ABANDON.split(' '), 'secret'));
        expect(tree.root.findAllByType(WordSelector)).toHaveLength(12);
        expect(phraseBox(tree).props.value).toBe(pasted);

        act(() => {
            app.handlePassphrase({ target: { value: '' } });
        });
        expect(app.state.seed).toBe(EMPTY_SEED);
        expect(app.state.addresses).toEqual({
            btc: 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
            evm: '0x9858EfFD232B4033E47d90003D41EC34EcaEda94',
        });
        const rendered = JSON.stringify(tree.toJSON());
        expect(rendered).toContain(EMPTY_SEED);
        expect(rendered).toContain('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
        expect(rendered).toContain('0x9858EfFD232B4033E47d90003D41EC34EcaEda94');
    });

    test('a pasted checksum failure is kept and shows no seed', () => {
        let tree;
        act(() => {
            tree = create(<App />);
        });
        const app = tree.getInstance();
        const broken = ABANDON.replace(/about$/, 'abandon');
        paste(tree, broken);
        expect(app.state.wordCount).toBe(12);
        expect(app.state.words[11]).toBe('abandon');
        expect(app.state.isCompleted).toBe(true);
        expect(app.state.checksumValid).toBe(false);
        expect(app.state.seed).toBe('');
        expect(app.state.addresses).toBe(null);
        const rendered = JSON.stringify(tree.toJSON());
        expect(rendered).toContain('Checksum does not match this phrase');
        expect(rendered).not.toContain('PBKDF2');
        expect(rendered).not.toContain('bc1q');
    });

    test('an unusable paste leaves the current phrase and hides its seed', () => {
        let tree;
        act(() => {
            tree = create(<App />);
        });
        const app = tree.getInstance();
        act(() => {
            app.handleGenerate();
        });
        const generated = app.state.words.slice();
        const seed = app.state.seed;
        paste(tree, 'not a phrase');
        expect(app.state.words).toEqual(generated);
        expect(app.state.phraseError).toBe(
            'Phrase has 3 words. Use 12, 15, 18, 21, or 24.'
        );
        expect(app.state.seed).toBe('');
        expect(app.state.addresses).toBe(null);
        const rendered = JSON.stringify(tree.toJSON());
        expect(rendered).not.toContain(seed);
        expect(rendered).toContain(
            'Phrase has 3 words. Use 12, 15, 18, 21, or 24.'
        );

        const unknown = ABANDON.replace('about', 'notaword');
        paste(tree, unknown);
        expect(app.state.words).toEqual(generated);
        expect(app.state.phraseError).toBe('Unknown word: notaword.');
        expect(app.state.seed).toBe('');
    });

    test('clearing the phrase box resets the page', () => {
        let tree;
        act(() => {
            tree = create(<App />);
        });
        const app = tree.getInstance();
        paste(tree, ABANDON);
        paste(tree, '   ');
        expect(app.state.phraseInput).toBe('');
        expect(app.state.phraseError).toBe('');
        expect(app.state.seed).toBe('');
        expect(app.state.addresses).toBe(null);
        expect(app.state.passphrase).toBe('');
        expect(app.state.wordCount).toBe(12);
        expect(app.state.isCompleted).toBe(false);
        expect(tree.root.findAllByType(WordSelector)[11].props.disabled).toBe(
            true
        );
    });
});
