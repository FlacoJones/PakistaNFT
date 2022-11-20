import { configureChains, createClient, VagmiPlugin } from 'vagmi'
import { infuraProvider } from 'vagmi/providers/infura'
import { alchemyProvider } from 'vagmi/providers/alchemy'
import { publicProvider } from 'vagmi/providers/public'
import { InjectedConnector } from 'vagmi/connectors/injected'
import { MetaMaskConnector } from 'vagmi/connectors/metaMask'
import { WalletConnectConnector } from 'vagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'vagmi/connectors/coinbaseWallet'
import { SUPPORTED_CHAINS } from '@/constants'

const infuraId = import.meta.env.VITE_INFURA_ID
const alchemyId = import.meta.env.VITE_ALCHEMY_ID

const { chains, provider } = configureChains(SUPPORTED_CHAINS, [
  infuraProvider({ infuraId }),
  alchemyProvider({ alchemyId }),
  publicProvider(),
])

const connectors = [
  new MetaMaskConnector({ chains }),
  new InjectedConnector({ chains }),
  new WalletConnectConnector({
    chains,
    options: {
      infuraId,
      qrcode: true,
    },
  }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: 'Save Pakistan',
    },
  }),
]

export const vagmiClient = createClient({
  autoConnect: true,
  provider,
  connectors,
})

export const vagmi = VagmiPlugin(vagmiClient)
