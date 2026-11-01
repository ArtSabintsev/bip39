import { getSeed } from './utils';
import { deriveAddresses } from './addresses';

const ABANDON =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('deriveAddresses', () => {
    const words = ABANDON.split(' ');

    test('BIP84 and BIP44 first addresses for the all-zero phrase', () => {
        const addresses = deriveAddresses(getSeed(words, ''));
        expect(addresses).toEqual({
            btc: 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
            evm: '0x9858EfFD232B4033E47d90003D41EC34EcaEda94',
        });
        expect(deriveAddresses(getSeed(words, ''), 1).btc).toBe(
            'bc1qnjg0jd8228aq7egyzacy8cys3knf9xvrerkf9g'
        );
    });

    test('a passphrase changes both addresses', () => {
        const empty = deriveAddresses(getSeed(words, ''));
        const other = deriveAddresses(getSeed(words, 'TREZOR'));
        expect(other.btc).not.toBe(empty.btc);
        expect(other.evm).not.toBe(empty.evm);
        expect(other.btc).toMatch(/^bc1q/);
        expect(other.evm).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });

    test('rejects a seed that is not 64 bytes', () => {
        expect(() => deriveAddresses('00')).toThrow('seed must be 64 bytes');
    });
});
