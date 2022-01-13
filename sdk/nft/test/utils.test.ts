import { JsonRpcProvider } from '@ethersproject/providers'
import { recoverSignatureFromPermit, Zora, signPermitMessage, sha256FromBuffer, constructBidShares, signMintWithSigMessage } from '@levinhs/zdk'
import { recoverSignatureFromMintWithSig } from '@zoralabs/zdk'
import { expect } from 'chai'
import { constructMediaData } from '../src/utils'

// import { mintCurrency, setupZora, ZoraConfigAddresses } from './helpers'

// import { Blockchain, generatedWallets } from '@zoralabs/core/dist/utils'

describe('Utilities in relation to EIP712', () => {
    let hash: string
    let drakeoHash: string
    let defaultTokenURI: string
    let defaultMetadataURI: string

    let provider = new JsonRpcProvider()
    // let blockchain = new Blockchain(provider)

    before(() => {
        hash = '0x7e09f03f4ac996de0dd42f1e9bb817857e74e6ec2dace9a0994b61b12ac9fdb2'
        drakeoHash = '0xd5e33ebf1b20fac9ac98664519415fb84283bcf149c229c4a5796f2c4d35a2ff'
        defaultTokenURI = 'https://arbitrary-example.com'
        defaultMetadataURI = 'https://unknown-metadata.com'
    })

//     beforeEach(async () => {
//         await blockchain.resetAsync()
//     })
// })

describe('EIP-712 Utilities', () => {
    describe('#signPermitMessage', () => {
        // let zapConfig: ZapConfiguredAddresses

        before(() => {
            zapConfig = {
                market: '',
                media: '',
                currency: '',
                // fill in with contract addresses ^^^
            }
        })

        it('signs the message properly', async () => {
            const provider = new JsonRpcProvider()
            // const [mainWallet, otherWallet] = generatedWallets(provider)

            // const zora = new Zora(provider, 50, zoraConfig.media, zoraConfig.market)
            const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 // 24 hours
            const domain = zora.eip712Domain()
            const eip712Sig = await signPermitMessage(
                mainWallet,
                otherWallet.address,
                1,
                1,
                deadline,
                domain
            )

            const recovered = await recoverSignatureFromPermit(
                otherWallet.address,
                1,
                1,
                deadline,
                domain,
                eip712Sig
            )

            expect(recovered.toLowerCase()).toBe(mainWallet.address.toLowerCase())
        })

        it('signs a permit message that is able to be and eventually processed on-chain', async () => {
            const provider = new JsonRpcProvider()
            const [mainWallet, otherWallet] = generatedWallets(provider)
            const onChainConfig = await setupZora(mainWallet, [otherWallet])
            const mainZap = new Zora(
                mainWallet,
                50,
                onChainConfig.media,
                onChainConfig.market
            )
            const contentHash = sha256FromBuffer(Buffer.from('Example content'))
            const metadataHash = sha256FromBuffer(Buffer.from('Example metadata'))

            const mediaData = constructMediaData(
                'https://mocha.com',
                'https://chai.com',
                contentHash,
                metadataHash
            )
            const bidShares = constructBidShares(10, 90, 0)
            await mainZap.mint(mediaData, bidShares)

            const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 // 24 hours
            const domain = mainZap.eip712Domain()
            const eip712Sig = await signPermitMessage(
                mainWallet,
                otherWallet.address,
                0,
                0,
                deadline,
                domain
            )

            const otherZap = new Zora(
                mainWallet,
                50,
                onChainConfig.media,
                onChainConfig.market
            )
            await otherZap.permit(otherWallet.address, 0, eip712Sig)
            const approved = await await otherZap.fetchApproved(0)
            expect(approved.toLowerCase()).to(otherWallet.address.toLowerCase())    // this toBe assertion was switched to 'to'
        })
    })

    describe('#recoverSignatureFromPermit', () => {
        // let zapConfig: ZapConfiguredAddresses

        // before(() => {
        //     zapConfig = {
        //         market: '',
        //         media: '',
        //         currency: '',
        //     }
        // })

        it('returns an alternate recovered address if the message is different', async () => {
            const provider = new JsonRpcProvider()
            const [mainWallet, otherWallet] = generatedWallets(provider)
            const zap = new Zora(provider, 50, zapConfig.media, zapConfig.market)
            const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 // 24 hours
            const domain = new zap.eip712Domain()
            const eipSig = await signPermitMessage(
                mainWallet,
                otherWallet.address,
                1,
                1,
                deadline,
                domain
            )

            const recovered = await recoverSignatureFromPermit(
                otherWallet.address,
                1,
                0,
                deadline,
                domain,
                eipSig
            )

            expect(recovered.toLowerCase().not.toBe(mainWallet.address.toLowerCase())
        })
    })

    describe('#signMintWithSig', () => {
        // config addresses need to be added
    })
})

it('signs the message correctly', async () => {
    const provider = new JsonRpcProvider()
    const [mainWallet] = generatedWallets(provider)
    const zap = new Zora(provider, 50, zoraConfig.media, zoraConfig.market)
    const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 // 24 hours
    const domain = zap.eip712Domain()
    const contentHash = sha256FromBuffer(Buffer.from('example content'))
    const metadataHash = sha256FromBuffer(Buffer.from('example metadata'))

    const eip712Sig = await signMintWithSigMessage(
        mainWallet,
        contentHash,
        metadataHash,
        Decimal.new(10).value,
        1,
        deadline,
        domain
    )

    const recovered = await recoverSignatureFromMintWithSig(
        contentHash,
        metadataHash,
        Decimal.new(10).value,
        1,
        deadline,
        domain,
        eip712Sig
    )

    expect(recovered.toLowerCase().to(mainWallet.address.toLowerCase()))
    })

    it('signs a mintWithSig message that is able to be processed on chain', async () => {
        const [mainWallet, otherWallet] = generatedWallets(provider)
        // const onChainConfig = await setupZap(mainWallet, [otherWallet])
        const onChainConfig = await setupZora(mainWallet, [otherWallet])
        const otherZap = new Zora(
            otherWallet,
            50,
            onChainConfig.media,
            onChainConfig.market
        )
        const contentHash = sha256FromBuffer(Buffer.from('example content'))
        const metadataHash = sha256FromBuffer(Buffer.from('example metadata'))
        const 

    })
})