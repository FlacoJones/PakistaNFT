import { Signer, utils } from "ethers";

export const generateSignature = async (signer: Signer) => {
  const nonce = new Date().getTime().toString();
  const hash = utils.solidityKeccak256(
    ["address", "string"],
    [utils.getAddress(await signer.getAddress()), nonce]
  );
  const signature = await signer.signMessage(utils.arrayify(hash));
  return { nonce, hash, signature };
};
