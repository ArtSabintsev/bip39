/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

// sharp 0.23 publishes no darwin-arm64 binary, and gatsby-plugin-manifest
// loads it at startup. Skip the icon manifest when it cannot load.
function manifestPlugin() {
    try {
        // sharp's own loader calls process.exit when the native binary is missing,
        // so probe the file instead of requiring the package.
        require.resolve('sharp/build/Release/sharp.node');
    } catch (err) {
        return null;
    }
    return {
        resolve: 'gatsby-plugin-manifest',
        options: {
            name: 'BIP39 Mnemonic Builder',
            short_name: 'BIP39',
            start_url: '/bip39',
            background_color: '#fff',
            theme_color: '#f59237',
            display: 'standalone',
            icon: 'src/images/btc512x512.png',
        },
    };
}

const manifest = manifestPlugin();

module.exports = {
    siteMetadata: {
        title: 'BIP39 Mnemonic Builder',
    },
    plugins: [
        'gatsby-plugin-styled-components',
        'gatsby-plugin-react-helmet',
        ...(manifest ? [manifest] : []),
    ],
    pathPrefix: '/bip39',
};
