import { configureChains, chain, createClient, VagmiPlugin } from 'vagmi'
import { publicProvider } from 'vagmi/providers/public'
import { InjectedConnector } from 'vagmi/connectors/injected'
import { WalletConnectConnector } from 'vagmi/connectors/walletConnect'

const { chains, provider } = configureChains([chain.optimism], [publicProvider()])

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
