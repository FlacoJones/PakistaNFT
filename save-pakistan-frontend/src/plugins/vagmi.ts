import { configureChains, chain, createClient, VagmiPlugin } from 'vagmi'
import { infuraProvider } from 'vagmi/providers/infura'
import { InjectedConnector } from 'vagmi/connectors/injected'
import { WalletConnectConnector } from 'vagmi/connectors/walletConnect'

const { chains, provider } = configureChains(
  [chain.optimism, chain.goerli],
  [infuraProvider({ infuraId: import.meta.env.VITE_INFURA_API_KEY })]
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
