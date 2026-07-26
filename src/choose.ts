import * as p from "@clack/prompts";
import templateJSON from "../template.json";
import colors, { type ColorKey } from "./colors";

interface TemplateChoice {
    name: string;
    value: string;
    color?: string;
    next?: Record<string, TemplateNode>;
}

interface TemplateNode {
    key?: string;
    description?: string;
    name: string;
    value?: string;
    choices?: TemplateChoice[];
}

type TemplateData = Record<string, TemplateNode>;

function handleCancel(value: unknown): asserts value is Exclude<typeof value, symbol> {
    if (p.isCancel(value)) {
        p.cancel("已取消创建项目。");
        process.exit(0);
    }
}

function colorize(label: string, color?: string) {
    if (color && colors[color as ColorKey]) {
        return colors[color as ColorKey](label);
    }
    return colors.green(label);
}

async function chooseTemplate() {
    const data = templateJSON as TemplateData;

    const name = await p.text({
        message: "请输入项目名称：",
        placeholder: "my-app",
        validate(input) {
            if (!input || input.trim() === "") {
                return "项目名称不能为空！";
            }
        },
    });
    handleCancel(name);

    const projectType = await p.select({
        message: "请选择项目类型：",
        options: Object.keys(data).map((key) => ({
            label: colorize(data[key].name),
            value: data[key].value ?? key,
        })),
    });
    handleCancel(projectType);

    const node = data[projectType as string];
    if (!node) {
        throw new Error(`未知的项目类型：${String(projectType)}`);
    }

    const template = await traverseChoices(node);
    return { name: String(name).trim(), template };
}

async function traverseChoices(node: TemplateNode, parentName = ""): Promise<string> {
    if (!node.choices) {
        return node.value ?? "";
    }

    const choice = await p.select({
        message: node.description || "请选择：",
        options: node.choices.map((item, index) => ({
            label: colorize(item.name, item.color),
            value: index,
        })),
    });
    handleCancel(choice);

    const selected = node.choices[choice as number];
    if (!selected) {
        throw new Error("无效的选项");
    }

    if (selected.next) {
        const nextKey = Object.keys(selected.next)[0];
        const nextName = parentName ? `${parentName}-${nextKey}` : selected.value;
        return traverseChoices(selected.next[nextKey], nextName);
    }

    return parentName ? `${parentName}-${selected.value}` : selected.value;
}

export default chooseTemplate;
