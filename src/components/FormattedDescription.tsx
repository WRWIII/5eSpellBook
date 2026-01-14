"use client";

import { useMemo } from "react";

type ParsedSegment =
  | { type: "paragraph"; content: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

interface FormattedDescriptionProps {
  description: string;
  className?: string;
}

function isTableBlock(block: string): boolean {
  const lines = block.trim().split("\n");
  return (
    lines.length >= 2 &&
    lines[0].includes("|") &&
    lines.some((line) => line.includes("---"))
  );
}

function parseTableBlock(block: string): ParsedSegment {
  const lines = block.trim().split("\n");

  // Find the separator line (contains ---)
  const separatorIndex = lines.findIndex((line) => line.includes("---"));

  // Headers are everything before the separator
  const headerLines = lines.slice(0, separatorIndex);
  const dataLines = lines.slice(separatorIndex + 1);

  // Parse header - take the last header line as the actual headers
  const headerLine = headerLines[headerLines.length - 1] || "";
  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  // Parse data rows
  const rows = dataLines
    .filter((line) => line.includes("|"))
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0)
    )
    .filter((row) => row.length > 0);

  return { type: "table", headers, rows };
}

function parseBulletList(text: string): ParsedSegment {
  // Split by bullet character and filter empty items
  const items = text
    .split("•")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return { type: "bullet-list", items };
}

function parseDescription(text: string): ParsedSegment[] {
  if (!text) return [];

  const segments: ParsedSegment[] = [];

  // First, check if there's a table in the text
  // Tables span multiple lines and are delimited by | characters
  const tablePattern = /(\|[^\n]+\|\n\|[\s-|]+\|\n(?:\|[^\n]+\|\n?)*)/g;

  let lastIndex = 0;
  let match;

  while ((match = tablePattern.exec(text)) !== null) {
    // Process text before the table
    const beforeTable = text.slice(lastIndex, match.index);
    if (beforeTable.trim()) {
      segments.push(...parseTextBlocks(beforeTable));
    }

    // Process the table
    segments.push(parseTableBlock(match[1]));
    lastIndex = match.index + match[1].length;
  }

  // Process remaining text after the last table
  const afterTables = text.slice(lastIndex);
  if (afterTables.trim()) {
    segments.push(...parseTextBlocks(afterTables));
  }

  return segments;
}

function parseTextBlocks(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];

  // Split by double newlines to get blocks
  const blocks = text.split(/\n\n+/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Check if this block contains bullets
    if (trimmed.includes("•")) {
      // Check if there's text before the first bullet
      const firstBulletIndex = trimmed.indexOf("•");
      if (firstBulletIndex > 0) {
        const textBefore = trimmed.slice(0, firstBulletIndex).trim();
        if (textBefore) {
          segments.push({ type: "paragraph", content: textBefore });
        }
      }
      segments.push(parseBulletList(trimmed));
    } else {
      segments.push({ type: "paragraph", content: trimmed });
    }
  }

  return segments;
}

export function FormattedDescription({
  description,
  className = "",
}: FormattedDescriptionProps) {
  const segments = useMemo(() => parseDescription(description), [description]);

  if (!description) return null;

  return (
    <div className={`spell-description ${className}`}>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case "paragraph":
            return (
              <p key={index} className="mb-3 last:mb-0 whitespace-pre-line">
                {segment.content}
              </p>
            );

          case "bullet-list":
            return (
              <ul key={index} className="spell-bullet-list mb-3 last:mb-0">
                {segment.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          case "table":
            return (
              <div key={index} className="spell-table-wrapper mb-3 last:mb-0">
                <table className="spell-table">
                  <thead>
                    <tr>
                      {segment.headers.map((header, i) => (
                        <th key={i}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {segment.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
