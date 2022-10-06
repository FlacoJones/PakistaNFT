import { readdirSync, readFileSync } from "fs";
import { task } from "hardhat/config";
import { NFTStorage, File } from "nft.storage";
import path from "path";

task("metadata:upload", "Upload all metadata to IPFS via NFT.Storage").setAction(async () => {
  const storage = new NFTStorage({
    token: process.env.NFT_STORAGE_API_KEY ?? "...",
  });

  const metadataDir = path.join(__dirname, "..", "metadata");
  const dir = readdirSync(metadataDir);
  const metadataList = dir.map((d) => {
    const metadata = JSON.parse(readFileSync(path.join(metadataDir, d), "utf-8"));
    return metadata;
  });
  console.log(metadataList);

  // storage.store()
  const cid = await storage.storeDirectory(
    metadataList.map((metadata, index) => new File([JSON.stringify(metadata)], `${index}.json`))
  );
  console.log("NFT.Storage CID:", cid);
});
