import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import ABI_ERC20 from './abis/ABI_ERC20.json';
import ABI_FIBLESS from './abis/ABI_FIBLESS.json';
import BC_FIBLESS from './abis/BC_FIBLESS.json';
import ABI_STAKE from './abis/ABI_STAKE.json';
import BC_STAKE from './abis/BC_STAKE.json';
import ABI_POLL from './abis/ABI_POLL.json';
import BC_POLL from './abis/BC_POLL.json';

const defaultRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const provider = new ethers.providers.Web3Provider(window.ethereum);
export let signer = provider.getSigner(0);
var cFIBLESS;
var cSTAKE;
var cPOLL;

//get account
provider.send("eth_requestAccounts", []);
provider.on('accountsChanged', async() => {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner(0);
});

export async function approve(token, spender) {
    let cERC20 = new ethers.Contract(token, ABI_ERC20, signer);
    cERC20.approve(spender, BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'));
}

export async function deployAll() {
    cFIBLESS = await new ethers.ContractFactory(ABI_FIBLESS, BC_FIBLESS, signer).deploy(defaultRouterAddress, "0x742B314470087a1DaDF42E29CC9B2900aB86c00a", "0x742B314470087a1DaDF42E29CC9B2900aB86c00a", "0x742B314470087a1DaDF42E29CC9B2900aB86c00a");
    await approve(await cFIBLESS.getWETH(), cFIBLESS.address);
    cSTAKE = await new ethers.ContractFactory(ABI_STAKE, BC_STAKE, signer).deploy(cFIBLESS.address);
    cPOLL = await new ethers.ContractFactory(ABI_POLL, BC_POLL, signer).deploy(cSTAKE.address);
    await cFIBLESS.setupAll(cSTAKE.address);
}

export async function getContracts() {
    console.log(cFIBLESS);
    console.log(cSTAKE);
    console.log(cPOLL);
}

//approve route for revenue
export async function transfer(reciever, weiIn) {
    await cFIBLESS.transfer(reciever, weiIn);
}

export async function swapTokens() {
    //tokenAddressIn, tokenAddressOut, weiIn, toAddress, routerAddress
    await approve(cFIBLESS.address, cFIBLESS.address);
    await cFIBLESS.swapTokens(cFIBLESS.address, await cFIBLESS.getWETH(), 100000000000, signer, await cFIBLESS.getDefaultRouterAddress());
}

export async function setTaxless() {
    await cFIBLESS.setTaxPerThousand(0);
}

export async function stake(weiIn) {
    await approve(cFIBLESS.address, cSTAKE.address);
    await cSTAKE.stake(signer, weiIn);
}