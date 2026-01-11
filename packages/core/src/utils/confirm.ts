import { consola } from "consola";
import { colors, stripAnsi } from "consola/utils";
import { nestedBox, renderNestedBox } from "./nestedBox";

export type ConfirmMarkerColor = "cyan" | "yellow" | "red" | "green" | "dim";

export const MARKERS = {
  rightArrow: "→",
  reload: "↻",
  cross: "✖",
  check: "✓",
  info: "ℹ",
  warning: "⚠",
  question: "?",
  plus: "+",
  minus: "−",
  dot: "•",
  star: "★",
  branch: "⎇",
  up: "↑",
  down: "↓",
} as const;

export type ConfirmIcon = keyof typeof MARKERS;

export type ConfirmRowItemNew = {
  title: {
    icon: ConfirmIcon;
    color?: ConfirmMarkerColor;
    text: string;
  };
  value: {
    color?: ConfirmMarkerColor;
    text: string;
  };
  disabled?: boolean;
}[];

type ConfirmRowItem = ConfirmRowItemNew[number];

const colorize = (text: string, color?: ConfirmMarkerColor) => {
  if (!color) return text;
  return colors[color](text);
};

const padRight = (text: string, visible: number, width: number) => {
  if (visible >= width) return text;
  return text + " ".repeat(width - visible);
};

const formatRowTitle = (row: ConfirmRowItem) => {
  const icon = MARKERS[row.title.icon];
  const titleText = `${icon} ${row.title.text}`;
  const color = row.disabled ? "dim" : row.title.color;
  return colorize(titleText, color);
};

const formatRowValue = (row: ConfirmRowItem) => {
  const color = row.disabled ? "dim" : row.value.color;
  return colorize(row.value.text, color);
};

export const formatConfirmBox = (title: string, rows: ConfirmRowItemNew) => {
  if (rows.length === 0) return title;

  let labelWidth = 0;
  const prepared: Array<{
    label: string;
    labelVisible: number;
    value: string;
  }> = new Array(rows.length);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const label = formatRowTitle(row);
    const labelVisible = stripAnsi(label).length;
    if (labelVisible > labelWidth) labelWidth = labelVisible;

    prepared[i] = {
      label,
      labelVisible,
      value: formatRowValue(row),
    };
  }

  const linesArr: string[] = new Array(prepared.length);
  for (let i = 0; i < prepared.length; i++) {
    const { label, labelVisible, value } = prepared[i]!;
    linesArr[i] = `${padRight(label, labelVisible, labelWidth)} : ${value}`;
  }

  return renderNestedBox({
    title,
    titlePrefix: "ℹ",
    lines: linesArr,
  }).join("\n");
};

export const confirm = (title: string, rows: ConfirmRowItemNew) => {
  if (rows.length === 0) {
    consola.info(title);
    return;
  }

  let labelWidth = 0;
  const prepared: Array<{
    label: string;
    labelVisible: number;
    value: string;
  }> = new Array(rows.length);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const label = formatRowTitle(row);
    const labelVisible = stripAnsi(label).length;
    if (labelVisible > labelWidth) labelWidth = labelVisible;

    prepared[i] = {
      label,
      labelVisible,
      value: formatRowValue(row),
    };
  }

  const linesArr: string[] = new Array(prepared.length);
  for (let i = 0; i < prepared.length; i++) {
    const { label, labelVisible, value } = prepared[i]!;
    linesArr[i] = `${padRight(label, labelVisible, labelWidth)} : ${value}`;
  }

  nestedBox({ title, titlePrefix: "ℹ", lines: linesArr });
};
