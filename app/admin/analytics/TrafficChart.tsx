"use client";
import { useState } from "react";
import type { DailyTraffic } from "@/lib/analytics/report";
import styles from "./page.module.css";

type Metric =
  | "visits"
  | "page_views"
  | "new_browsers"
  | "growth"
  | "signups"
  | "saves"
  | "newsletter";
const labels: Record<Metric, string> = {
  visits: "Visits",
  page_views: "Page views",
  new_browsers: "New browsers",
  growth: "Browser growth",
  signups: "Accounts",
  saves: "Saves",
  newsletter: "Digest opt-ins",
};
const dateLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
export default function TrafficChart({
  daily,
  firstEvent,
  conversions = false,
}: {
  daily: DailyTraffic[];
  firstEvent: string | null;
  conversions?: boolean;
}) {
  const [metric, setMetric] = useState<Metric>(
    conversions ? "signups" : "visits",
  );
  const [selected, setSelected] = useState<number | null>(null);
  const options: Metric[] = conversions
    ? ["signups", "saves", "newsletter"]
    : ["visits", "page_views", "new_browsers", "growth"];
  const measured = firstEvent
    ? daily.filter((d) => d.date >= firstEvent.slice(0, 10))
    : [];
  const values = measured.reduce<number[]>((result, day) => {
    const value =
      metric === "growth"
        ? (result[result.length - 1] || 0) + day.new_browsers
        : day[metric];
    return [...result, value];
  }, []);
  const max = Math.max(1, ...values);
  const w = 900,
    h = 240,
    left = 0,
    right = 8,
    top = 16,
    bottom = 16;
  const x = (i: number) =>
    left + (i * (w - left - right)) / Math.max(1, measured.length - 1);
  const y = (value: number) => h - bottom - (value / max) * (h - top - bottom);
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const index =
    selected === null
      ? Math.max(0, measured.length - 1)
      : Math.min(selected, measured.length - 1);
  const point = measured[index];
  return (
    <div>
      <div
        className={styles.chartControls}
        role="group"
        aria-label={
          conversions ? "Conversion chart metric" : "Traffic chart metric"
        }
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={metric === option}
            onClick={() => {
              setMetric(option);
              setSelected(null);
            }}
          >
            {labels[option]}
          </button>
        ))}
      </div>
      {point ? (
        <>
          <div className={styles.chartReadout} aria-live="polite">
            <strong>{values[index].toLocaleString("en-US")}</strong>
            <span>
              {labels[metric]} on {dateLabel(point.date)}
              {index === measured.length - 1 ? " (today so far)" : ""}
            </span>
          </div>
          <div className={styles.plot}>
            <div className={styles.chartScale}>
              <span>{max}</span>
              <span>{Math.round(max / 2)}</span>
              <span>0</span>
            </div>
            <svg
              preserveAspectRatio="none"
              className={styles.chart}
              viewBox={`0 0 ${w} ${h}`}
              role="img"
              aria-label={`${labels[metric]} from ${dateLabel(measured[0].date)} to ${dateLabel(measured[measured.length - 1].date)}. Explore exact counts with the date slider or daily table.`}
            >
              <title>{`${labels[metric]} over time`}</title>
              {[0, 0.5, 1].map((f) => (
                <g key={f}>
                  <line
                    x1={left}
                    x2={w - right}
                    y1={y(max * f)}
                    y2={y(max * f)}
                    stroke="#dce7e5"
                  />
                </g>
              ))}
              <polygon
                points={`${left},${h - bottom} ${points} ${x(values.length - 1)},${h - bottom}`}
                fill="#e1f2eb"
              />
              <polyline
                points={points}
                fill="none"
                stroke="#17634b"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {values.map((v, i) => (
                <circle
                  key={measured[i].date}
                  cx={x(i)}
                  cy={y(v)}
                  r={i === index ? 5 : 3}
                  fill="#17634b"
                  onMouseEnter={() => setSelected(i)}
                >
                  <title>{`${dateLabel(measured[i].date)}: ${v} ${labels[metric]}`}</title>
                </circle>
              ))}
              <line
                x1={x(index)}
                x2={x(index)}
                y1={top}
                y2={h - bottom}
                stroke="#17634b"
                strokeDasharray="3 5"
                opacity="0.3"
              />
            </svg>
          </div>
          <div className={styles.chartDates}>
            <span>{dateLabel(measured[0].date)}</span>
            <span>{dateLabel(measured[measured.length - 1].date)}</span>
          </div>
          <label className={styles.sliderLabel}>
            Explore dates
            <input
              aria-label={`${labels[metric]} chart date`}
              type="range"
              min="0"
              max={Math.max(0, measured.length - 1)}
              value={index}
              onChange={(e) => setSelected(Number(e.target.value))}
            />
          </label>
        </>
      ) : (
        <p className={styles.empty}>
          Your first measurements will appear here.
        </p>
      )}
      <p className={styles.caption}>
        {metric === "growth"
          ? "Cumulative newly observed browsers within this period. This is not an all-time user total."
          : "Days use UTC. Today is incomplete; dates before measurement began are omitted."}
      </p>
    </div>
  );
}
