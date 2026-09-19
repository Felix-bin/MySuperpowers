import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const extensionDir = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(extensionDir, "../../skills");

export default function superpowersPiExtension(pi: ExtensionAPI) {
	// 仅注册技能，启动和压缩上下文时不注入工作流。
	pi.on("resources_discover", async () => ({ skillPaths: [skillsDir] }));
}
