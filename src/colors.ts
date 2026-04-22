const ESC = '\x1b[';
const R = `${ESC}0m`;

const colors = {
    green:       (s: string) => `${ESC}32m${s}${R}`,
    greenBright: (s: string) => `${ESC}92m${s}${R}`,
    yellow:      (s: string) => `${ESC}33m${s}${R}`,
    blue:        (s: string) => `${ESC}34m${s}${R}`,
    blueBright:  (s: string) => `${ESC}94m${s}${R}`,
    red:         (s: string) => `${ESC}31m${s}${R}`,
    gray:        (s: string) => `${ESC}90m${s}${R}`,
    magenta:     (s: string) => `${ESC}35m${s}${R}`,
    cyan:        (s: string) => `${ESC}36m${s}${R}`,
    bold:        (s: string) => `${ESC}1m${s}${R}`,
} as const;

export type ColorKey = keyof typeof colors;
export default colors;
