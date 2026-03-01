/**
 * @author Leon Zandman [leon@wirwar.com]
 * @copyright Crown Copyright 2027
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";
import { zstdInit, compress } from "../lib/Zstd.mjs";

/**
 * Zstd Compress operation
 */
class ZstdCompress extends Operation {

    /**
     * ZstdCompress constructor
     */
    constructor() {
        super();

        this.name = "Zstd Compress";
        this.module = "Compression";
        this.description = "Compresses data using the Zstandard (Zstd) algorithm. Zstd offers high compression ratios at fast speeds and is widely used in Linux, databases, container images, and network protocols.";
        this.infoURL = "https://wikipedia.org/wiki/Zstandard";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Compression level",
                type: "number",
                value: 3,
                min: 1,
                max: 22
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    async run(input, args) {
        const [level] = args;
        if (input.byteLength === 0) throw new OperationError("Please provide an input.");
        if (isWorkerEnvironment()) self.sendStatusMessage("Loading Zstd...");
        await zstdInit();
        if (isWorkerEnvironment()) self.sendStatusMessage("Compressing data...");
        try {
            const result = compress(new Uint8Array(input), level);
            return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
        } catch (err) {
            throw new OperationError(`Failed to compress: ${err.message}`);
        }
    }

}

export default ZstdCompress;
