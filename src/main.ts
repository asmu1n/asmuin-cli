import path from "path";
import choose from "./choose";
import colors from "./colors";
import { downloadAndExtractTarball } from "./tarball";

const BANNER = `
    _        __  __       _         _____                    _       _       
   / \\   ___|  \\/  |_   _(_)_ __   |_   _|__ _ __ ___  _ __ | | __ _| |_ ___ 
  / _ \\ / __| |\\/| | | | | | '_ \\    | |/ _ \\ '_ \` _ \\| '_ \\| |/ _\` | __/ _ \\
 / ___ \\\\__ \\ |  | | |_| | | | | |   | |  __/ | | | | | |_) | | (_| | ||  __/
/_/   \\_\\___/_|  |_|\\__,_|_|_| |_|   |_|\\___|_| |_| |_| .__/|_|\\__,_|\\__\\___|
                                                        |_|                    
`;

const REPO_URL = "https://github.com/AsMuin/project-template";

const BRANCH_MAP: Record<string, string> = {
    react: "react",
    "express-mongodb": "express-mongodb",
    "express-postgresql": "express-postgresql",
    "next-postgresql": "next-postgresql",
};

async function main() {
    console.log(colors.green(BANNER));
    console.log(colors.blueBright("欢迎！🎉🎉"));
    console.log(colors.yellow("请选择一个模版开始你的项目：\n"));

    const { name, template } = await choose();

    const branch = BRANCH_MAP[template] || template;
    const dest = path.join(process.cwd(), name);
    const tarUrl = `${REPO_URL}/archive/refs/heads/${branch}.tar.gz`;

    console.log(colors.green(`正在下载 ${branch} 分支的模板...`));
    console.log(colors.gray(`模板地址: ${REPO_URL}#${branch}`));

    try {
        console.log(`正在下载模板文件：${tarUrl}`);
        console.log("正在解压模板文件...");
        await downloadAndExtractTarball(tarUrl, dest);
        console.log(colors.greenBright("\n🎉 项目已成功创建！"));
        console.log(colors.yellow(`\n打开编辑器进入项目目录: code ${name}`));
    } catch (error) {
        const err = error as Error;
        console.error(colors.red("❌ 发生错误："), err.message);
    }
}

main().catch((error) => {
    console.error(colors.red("❌ 未捕获的错误："), error);
});
