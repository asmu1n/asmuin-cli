import inquirer from "inquirer";
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

async function chooseTemplate() {
    const data = templateJSON as TemplateData;

    const { name } = await inquirer.prompt<{ name: string }>([
        {
            type: "input",
            name: "name",
            message: colors.bold("请输入项目名称："),
            validate(input: string) {
                if (!input || input.trim() === "") {
                    return "项目名称不能为空！";
                }
                return true;
            },
        },
    ]);

    const { projectType } = await inquirer.prompt<{ projectType: string }>([
        {
            type: "list",
            name: "projectType",
            message: colors.bold("请选择项目类型："),
            choices: Object.keys(data).map((key) => ({
                name: colors.green(data[key].name),
                value: data[key].value,
            })),
        },
    ]);

    const template = await traverseChoices(data[projectType]);
    return { name, template };
}

async function traverseChoices(node: TemplateNode, parentName = "") {
    if (!node.choices) {
        return node.value ?? "";
    }

    const { choice } = await inquirer.prompt<{ choice: TemplateChoice }>([
        {
            type: "list",
            name: "choice",
            message: colors.bold(node.description || "请选择："),
            choices: node.choices.map((item) => ({
                name:
                    item.color && colors[item.color as ColorKey]
                        ? colors[item.color as ColorKey](item.name)
                        : colors.green(item.name),
                value: item,
            })),
        },
    ]);

    if (choice.next) {
        const nextKey = Object.keys(choice.next)[0];
        const nextName = parentName ? `${parentName}-${nextKey}` : choice.value;
        return traverseChoices(choice.next[nextKey], nextName);
    }

    const returnValue = parentName
        ? `${parentName}-${choice.value}`
        : choice.value;
    return returnValue;
}

export default chooseTemplate;
