import { getAddress, isAddress } from "ethers/lib/utils";
import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";
import keccak256 from "keccak256";

export class MerkleTreeUtil {
  public static createMerkleTree(leaves: string[]): MerkleTree {
    const hashedLeaves = leaves.map((leaf) => keccak256(leaf));

    return new MerkleTree(hashedLeaves, keccak256, { sortPairs: true });
  }

  public static createMerkleProof(
    tree: MerkleTree,
    leaf: string,
    index?: number
  ): string[] {
    const hash = ethers.utils.solidityKeccak256(["address"], [leaf]);

    return tree.getHexProof(hash, index);
  }

  public static createMerkleRoot(tree: MerkleTree): string {
    return tree.getHexRoot();
  }

  public static sanitizeLeaves(leaves: string[]): string[] {
    return leaves
      .filter((address) => isAddress(address))
      .map((address) => getAddress(address.trim()));
  }
}
