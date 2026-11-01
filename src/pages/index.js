import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Helmet } from 'react-helmet';

import WordSelector from '../components/WordSelector';

import { colors, breakpoints, mono } from '../styles';

// english only for now, TODO: add other languages
import WORDLIST from '../wordlists';

import {
    ENTROPY_BITS_MAP,
    LENGTH_OPTIONS,
    getDetails,
    getSeed,
    generateRandomMnemonic,
    mnemonicFromEntropy,
    parseMnemonic,
    withValidLastWord,
    zeroFill,
} from '../utils';
import {
    BTC_ADDRESS_PATH,
    EVM_ADDRESS_PATH,
    deriveAddresses,
} from '../addresses';

const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        background: ${colors.bgPage};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
        box-sizing: border-box;
        div, input, textarea, button
        {
            box-sizing: inherit;
        }
        color: ${colors.textPrimary};
        input, textarea, button {
            font-family: inherit;
            -webkit-appearance: none;
        }
    }
`;

const Page = styled.div`
    max-width: 1040px;
    margin: 0 auto;
    padding: 40px 24px 64px;
    @media (${breakpoints.phone}) {
        padding: 24px 14px 48px;
    }
`;

const Title = styled.h1`
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.03em;
    text-align: center;
    margin: 0;
`;

const Lead = styled.p`
    margin: 8px auto 0;
    max-width: 36em;
    text-align: center;
    color: ${colors.textSecondary};
    font-size: 15px;
    line-height: 1.45;
`;

const Header = styled.h2`
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin: 22px 0 4px;
`;

const Subheader = styled.span`
    display: block;
    font-size: 13px;
    font-weight: normal;
    line-height: 1.4;
    color: ${colors.textSecondary};
    margin-top: 2px;
`;

const Controls = styled.div`
    margin-top: 28px;
    padding: 16px;
    background: ${colors.bgPrimary};
    border: 1px solid ${colors.border};
    border-radius: 16px;
`;

const CenteredRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px;
`;

const FieldLabel = styled.label`
    display: block;
    width: 100%;
    max-width: 560px;
    margin: 14px auto 0;
    font-size: 12px;
    font-weight: 600;
    color: ${colors.textSecondary};
    > textarea {
        display: block;
        width: 100%;
        margin-top: 6px;
        border: 1px solid ${colors.border};
        border-radius: 10px;
        background: ${colors.bgSecondary};
        padding: 10px 12px;
        height: 64px;
        resize: vertical;
        font-size: 15px;
        line-height: 1.4;
        color: ${colors.textPrimary};
        &:focus {
            outline: none;
            border-color: ${colors.bgAccent};
            background: ${colors.bgPrimary};
        }
    }
`;

const PhraseLabel = styled(FieldLabel)`
    > textarea {
        height: 96px;
        font-family: ${mono};
        font-size: 14px;
        line-height: 1.45;
    }
`;

const CountContainer = styled.div`
    display: flex;
    border: 1px solid ${colors.border};
    border-radius: 10px;
    overflow: hidden;
    background: ${colors.bgSecondary};
`;

const RadioGroupLabel = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: ${colors.textSecondary};
`;

const CountLabel = styled.label`
    padding: 8px 14px;
    cursor: pointer;
    border-right: 1px solid ${colors.border};
    font-variant-numeric: tabular-nums;
    &:hover {
        background-color: ${colors.bgHover};
    }
    &.selected {
        color: ${colors.textSelected};
        background-color: ${colors.bgSelected};
    }
    &:last-child {
        border-right: none;
    }
`;

const CountRadio = styled.input.attrs(() => ({
    type: 'radio',
    name: 'wordcount',
}))`
    position: absolute;
    opacity: 0;
    cursor: pointer;
`;

const GenerateButton = styled.button`
    padding: 8px 16px;
    background-color: ${colors.bgAccent};
    border: 1px solid ${colors.bgAccent};
    color: ${colors.textAccent};
    border-radius: 10px;
    outline: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    &:hover {
        filter: brightness(1.08);
    }
`;

const ResetButton = styled(GenerateButton)`
    background-color: transparent;
    color: ${colors.textPrimary};
    border-color: ${colors.border};
    &:hover {
        filter: none;
        background: ${colors.bgSecondary};
    }
`;

const FlexRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 18px -6px 0;
`;

const FlexItem = styled.div`
    flex: 0 0 25%;
    padding: 6px;
    @media (${breakpoints.tablet}) {
        flex: 0 0 50%;
    }
`;

const DetailsContainer = styled.div`
    margin-top: 22px;
    padding: 8px 22px 22px;
    background: ${colors.bgPrimary};
    border: 1px solid ${colors.border};
    border-radius: 16px;
    input {
        display: block;
        width: 100%;
        max-width: 360px;
        padding: 10px 12px;
        border: 1px solid ${colors.border};
        border-radius: 10px;
        margin: 6px 0 10px;
        font-size: 16px;
        background: ${colors.bgSecondary};
        &:focus {
            outline: none;
            border-color: ${colors.bgAccent};
            background: ${colors.bgPrimary};
        }
    }
    @media (${breakpoints.phone}) {
        padding: 4px 14px 16px;
    }
`;

const WordWithIndex = styled.div`
    display: inline-block;
    border: 1px solid ${colors.border};
    border-radius: 10px;
    padding: 8px 10px;
    margin: 0 8px 8px 0;
    background: ${colors.bgSecondary};
    min-width: 9em;
    > div > span {
        color: ${colors.textSecondary};
        font-size: 12px;
        margin-left: 6px;
    }
    > div:last-child {
        margin-top: 2px;
        font-family: ${mono};
        font-size: 11px;
        color: ${colors.textSecondary};
    }
`;

const DetailsLabel = styled.span`
    display: block;
    font-weight: bold;
    font-size: 12px;
`;

const LongString = styled.span`
    display: block;
    word-break: break-all;
    padding: 10px 12px;
    margin: 6px 0 0;
    border: 1px solid ${colors.border};
    border-radius: 10px;
    background-color: ${colors.bgSecondary};
    font-family: ${mono};
    font-size: 13px;
    line-height: 1.45;
`;

const ChecksumWarning = styled.p`
    color: ${colors.warning};
    font-weight: 600;
    margin-top: 18px;
`;

const PhraseError = styled.span`
    display: block;
    margin-top: 6px;
    color: ${colors.warning};
    font-weight: 600;
    font-size: 13px;
    line-height: 1.4;
`;

const WordCount = props => {
    const { value, onChange } = props;
    return (
        <CenteredRow>
            <RadioGroupLabel>Length</RadioGroupLabel>
            <CountContainer>
                {LENGTH_OPTIONS.map(count => {
                    const isSelected = value === count;
                    return (
                        <CountLabel
                            key={`wc${count}`}
                            className={isSelected ? 'selected' : null}
                        >
                            <CountRadio
                                key={count}
                                value={count}
                                checked={isSelected}
                                onChange={() => onChange && onChange(count)}
                            />
                            <span>{count}</span>
                        </CountLabel>
                    );
                })}
            </CountContainer>
        </CenteredRow>
    );
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.textAreaRef = React.createRef();
        this.state = {
            wordCount: 24,
            words: new Array(24),
            wordList: WORDLIST,
            validLastWords: [],
            isCompleted: false,
            entropyInput: '',
            phraseInput: '',
            phraseError: '',
            seed: '',
            addresses: null,
            passphrase: '',
            checksumValid: false,
        };
    }

    seedFields = (words, passphrase, ok) => {
        if (!ok) {
            return { seed: '', addresses: null };
        }
        const seed = getSeed(words, passphrase || '');
        return { seed: seed, addresses: deriveAddresses(seed) };
    };

    phraseText = words =>
        words.length && words.every(Boolean) ? words.join(' ') : '';

    clearTextArea = () => {
        if (this.textAreaRef.current) {
            this.textAreaRef.current.value = '';
        }
    };

    // Drop entropy, checksum, and last-word candidates unless this result replaces them.
    phraseState = (words, details, extra) => {
        return {
            words,
            entropy: null,
            checksum: null,
            checksumValid: false,
            validLastWords: [],
            addresses: null,
            ...details,
            ...extra,
            ...this.seedFields(
                words,
                extra.passphrase,
                details.isCompleted && details.checksumValid
            ),
        };
    };

    handleCountChange = wordCount => {
        const { words, wordList, passphrase, entropyInput } = this.state;
        let updatedWords = entropyInput
            ? mnemonicFromEntropy(entropyInput, wordCount, wordList)
            : [...new Array(wordCount)].map((val, i) => words[i]);
        let details = getDetails(updatedWords, wordList);
        if (!entropyInput) {
            updatedWords = withValidLastWord(
                updatedWords,
                details.validLastWords
            );
            details = getDetails(updatedWords, wordList);
        }
        this.setState(
            this.phraseState(updatedWords, details, {
                wordCount,
                passphrase: details.isCompleted ? passphrase : '',
                phraseInput: this.phraseText(updatedWords),
                phraseError: '',
            })
        );
    };

    handleGenerate = () => {
        const { wordCount, wordList, passphrase } = this.state;
        const words = generateRandomMnemonic(wordCount, wordList);
        const details = getDetails(words, wordList);
        this.setState(
            this.phraseState(words, details, {
                entropyInput: '',
                passphrase,
                phraseInput: words.join(' '),
                phraseError: '',
            })
        );
        this.clearTextArea();
    };

    handleReset = () => {
        const { wordCount } = this.state;
        this.setState({
            words: new Array(wordCount),
            isCompleted: false,
            checksumValid: false,
            validLastWords: [],
            entropy: null,
            checksum: null,
            entropyInput: '',
            phraseInput: '',
            phraseError: '',
            seed: '',
            addresses: null,
            passphrase: '',
        });
        this.clearTextArea();
    };

    handleEntropy = e => {
        const entropyInput = e.target.value;
        if (!entropyInput) {
            this.handleReset();
            return;
        }
        const { wordCount, wordList, passphrase } = this.state;
        const words = mnemonicFromEntropy(entropyInput, wordCount, wordList);
        const details = getDetails(words, wordList);
        this.setState(
            this.phraseState(words, details, {
                entropyInput,
                passphrase,
                phraseInput: words.join(' '),
                phraseError: '',
            })
        );
    };

    handlePhrase = e => {
        const phraseInput = e.target.value;
        if (!phraseInput.trim()) {
            this.handleReset();
            return;
        }
        const { wordList, passphrase } = this.state;
        const parsed = parseMnemonic(phraseInput, wordList);
        if (parsed.error) {
            // Leave the current words in place. The seed stays hidden while
            // this text does not match them.
            this.setState({
                phraseInput,
                phraseError: parsed.error,
                seed: '',
                addresses: null,
            });
            return;
        }
        // Keep the pasted last word even when its checksum is wrong.
        const words = parsed.words;
        const details = getDetails(words, wordList);
        this.setState(
            this.phraseState(words, details, {
                wordCount: words.length,
                entropyInput: '',
                passphrase,
                phraseInput,
                phraseError: '',
            })
        );
        this.clearTextArea();
    };

    handleChange = ({ word, index }) => {
        const { wordCount, words, wordList, passphrase } = this.state;
        let updatedWords = [...new Array(wordCount)].map((val, i) => {
            return i === index ? word : words[i];
        });
        let details = getDetails(updatedWords, wordList);
        if (index !== wordCount - 1) {
            updatedWords = withValidLastWord(
                updatedWords,
                details.validLastWords
            );
            details = getDetails(updatedWords, wordList);
        }
        this.setState(
            this.phraseState(updatedWords, details, {
                entropyInput: '',
                passphrase,
                phraseInput: this.phraseText(updatedWords),
                phraseError: '',
            })
        );
        this.clearTextArea();
    };

    handlePassphrase = e => {
        const passphrase = e.target.value;
        const { words, isCompleted, checksumValid } = this.state;
        this.setState({
            passphrase,
            ...this.seedFields(
                words,
                passphrase,
                isCompleted && checksumValid
            ),
        });
    };

    renderWordWithIndex = (word, i) => {
        const { wordList } = this.state;
        const listIndex = wordList.indexOf(word);
        const binary = zeroFill(listIndex.toString(2), 11);
        return (
            <WordWithIndex key={`wi${i}`}>
                <div>
                    <strong>{word}</strong> <span>{listIndex}</span>
                </div>
                <div>{binary}</div>
            </WordWithIndex>
        );
    };

    render() {
        const {
            words,
            wordCount,
            wordList,
            validLastWords,
            entropy,
            checksum,
            seed,
            addresses,
            isCompleted,
            checksumValid,
            passphrase,
            phraseInput,
            phraseError,
        } = this.state;
        // console.log(this.state);
        // console.log(words.join(' '));
        const wordSelectors = [];
        const entropyBits = ENTROPY_BITS_MAP[wordCount];
        const leftoverBits = entropyBits - 11 * (wordCount - 1);
        const totalBits = entropyBits + (checksum || {}).length;

        for (let i = 0; i < wordCount; i++) {
            let isLastWord = i === wordCount - 1;
            wordSelectors.push(
                <FlexItem key={`word${i}`}>
                    <WordSelector
                        index={i}
                        indexDisplay={i + 1}
                        word={words[i] || ''}
                        wordList={isLastWord ? validLastWords : wordList}
                        disabled={isLastWord && validLastWords.length === 0}
                        onChange={this.handleChange}
                    />
                </FlexItem>
            );
        }

        return (
            <Page>
                <GlobalStyles />
                <Helmet>
                    <title>BIP39 Mnemonic Builder</title>
                    <meta
                        name="description"
                        content="Create a BIP39 custom recovery seed phrase for your bitcoin wallet."
                    ></meta>
                </Helmet>
                <Title>BIP39 Mnemonic Builder</Title>
                <Lead>
                    Paste a phrase, pick the words, or generate them here. The
                    phrase never leaves this page.
                </Lead>
                <Controls>
                    <CenteredRow>
                        <WordCount
                            value={wordCount}
                            onChange={this.handleCountChange}
                        />
                        <GenerateButton onClick={this.handleGenerate}>
                            Generate
                        </GenerateButton>
                        <ResetButton onClick={this.handleReset}>
                            Reset
                        </ResetButton>
                    </CenteredRow>
                    <PhraseLabel>
                        Phrase
                        <textarea
                            name="bip39-phrase"
                            placeholder="Paste 12, 15, 18, 21, or 24 words."
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            data-lpignore="true"
                            data-1p-ignore="true"
                            value={phraseInput}
                            onChange={this.handlePhrase}
                        />
                        {phraseError ? (
                            <PhraseError>{phraseError}</PhraseError>
                        ) : null}
                    </PhraseLabel>
                    <FieldLabel>
                        Entropy
                        <textarea
                            ref={this.textAreaRef}
                            placeholder="Optional. The phrase is the SHA-256 of whatever you type."
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            onChange={this.handleEntropy}
                        />
                    </FieldLabel>
                </Controls>
                <FlexRow>{wordSelectors}</FlexRow>
                {isCompleted && !phraseError ? (
                    <DetailsContainer>
                        <Header>
                            Entropy - {entropyBits} bits
                            <Subheader>
                                {wordCount - 1} words &times; 11 bits ={' '}
                                {entropyBits - leftoverBits} bits +{' '}
                                {leftoverBits} extra bits ={' '}
                                {Math.pow(2, leftoverBits)} valid last words
                            </Subheader>
                        </Header>
                        <LongString>{entropy.hex}</LongString>
                        <Header>
                            Checksum - {checksum.length} bits
                            <Subheader>
                                First {checksum.length} bits of SHA-256 hash of
                                entropy
                            </Subheader>
                        </Header>
                        <div>
                            <DetailsLabel>Hash</DetailsLabel>
                            <LongString>{checksum.hash}</LongString>
                        </div>
                        <div>
                            <DetailsLabel>
                                First {checksum.length} bits
                            </DetailsLabel>
                            <LongString>{checksum.firstBits}</LongString>
                        </div>
                        <Header>
                            Result - {totalBits} bits
                            <Subheader>
                                Entropy + checksum = {wordCount} words &times;
                                11 bits = {totalBits}. Word / index / binary
                                index.
                            </Subheader>
                        </Header>
                        <div>{words.map(this.renderWordWithIndex)}</div>
                        {checksumValid ? (
                            <div>
                                <Header>
                                    Seed - 512 bits
                                    <Subheader>
                                        PBKDF2 - SHA-512 / 2048 iterations
                                    </Subheader>
                                </Header>
                                <div>
                                    <DetailsLabel>
                                        Optional Passphrase
                                    </DetailsLabel>
                                    <input
                                        type="text"
                                        name="bip39-passphrase"
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        value={passphrase}
                                        onChange={this.handlePassphrase}
                                    />
                                </div>
                                <LongString>{seed}</LongString>
                                {addresses ? (
                                    <div>
                                        <Header>
                                            Addresses
                                            <Subheader>
                                                First receive address from
                                                this seed. Bitcoin is native
                                                SegWit. Derived here.
                                            </Subheader>
                                        </Header>
                                        <div>
                                            <DetailsLabel>
                                                Bitcoin {BTC_ADDRESS_PATH}
                                            </DetailsLabel>
                                            <LongString>
                                                {addresses.btc}
                                            </LongString>
                                        </div>
                                        <div>
                                            <DetailsLabel>
                                                EVM {EVM_ADDRESS_PATH}
                                            </DetailsLabel>
                                            <LongString>
                                                {addresses.evm}
                                            </LongString>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <ChecksumWarning>
                                Checksum does not match this phrase. No seed is
                                shown until the last word is valid.
                            </ChecksumWarning>
                        )}
                    </DetailsContainer>
                ) : null}
            </Page>
        );
    }
}

export default App;
