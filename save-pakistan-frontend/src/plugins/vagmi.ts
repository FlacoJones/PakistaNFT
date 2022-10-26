import { configureChains, chain, createClient, VagmiPlugin } from 'vagmi'
import { alchemyProvider } from 'vagmi/providers/alchemy'
import { InjectedConnector } from 'vagmi/connectors/injected'
import { WalletConnectConnector } from 'vagmi/connectors/walletConnect'

const { chains, provider } = configureChains(
  [chain.optimism, chain.goerli],
  [alchemyProvider({ alchemyId: 'kWZ8YJZFfStiHTBmEFzVkID9KKrKI8ZD' })]
)

const connectors = [
  new InjectedConnector({ chains }),
  new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
    },
  }),
]

export const vagmiClient = createClient({
  autoConnect: true,
  provider,
  connectors,
})

export const vagmi = VagmiPlugin(vagmiClient)
