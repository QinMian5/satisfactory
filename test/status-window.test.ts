// abstract: Tests for status-window creation behavior around startup presentation.
// out_of_scope: Real Electron BrowserWindow construction and renderer execution.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStatusWindow } from "../src/main/windows/status-window.js";

const electronMock = vi.hoisted(() => {
  const calls: string[] = [];
  const fakeWindow = {
    maximize: vi.fn(() => {
      calls.push("maximize");
    }),
    loadFile: vi.fn(() => {
      calls.push("loadFile");
      return Promise.resolve();
    }),
    loadURL: vi.fn(() => {
      calls.push("loadURL");
      return Promise.resolve();
    }),
  };

  const BrowserWindow = vi.fn(function BrowserWindow() {
    return fakeWindow;
  });

  return {
    calls,
    fakeWindow,
    BrowserWindow,
  };
});

vi.mock("electron", () => ({
  BrowserWindow: electronMock.BrowserWindow,
}));

beforeEach(() => {
  electronMock.calls.length = 0;
  electronMock.BrowserWindow.mockClear();
  electronMock.fakeWindow.maximize.mockClear();
  electronMock.fakeWindow.loadFile.mockClear();
  electronMock.fakeWindow.loadURL.mockClear();
});

describe("createStatusWindow", () => {
  it("maximizes the status window before loading the renderer", () => {
    createStatusWindow("C:\\app\\preload.js", {
      kind: "url",
      value: "http://localhost:5173",
    });

    expect(electronMock.fakeWindow.maximize).toHaveBeenCalledTimes(1);
    expect(electronMock.calls).toEqual(["maximize", "loadURL"]);
  });
});
